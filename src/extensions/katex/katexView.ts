import { BalloonPosition } from '@editor/ui/Balloon'
import { createHTMLElement, setSelectionAfter } from '@editor/utils'
import { type Editor } from '@tiptap/core'
import { type Node as ProseMirrorNode } from '@tiptap/pm/model'
import { type NodeView } from '@tiptap/pm/view'
import katex from 'katex'

import { parseLatex } from './katex'
import { KatexBalloon } from './katexBalloon'

export function updateLatexDisplay(latex: string, containerDisplay: Element) {
  const formula = latex

  try {
    const matches = parseLatex(formula)
    const latexFormula = matches
    containerDisplay.innerHTML = katex.renderToString(latexFormula, {
      output: 'html'
    })
    containerDisplay.classList.remove('math-tex-error')
  } catch (error) {
    containerDisplay.innerHTML = formula
    containerDisplay.classList.add('math-tex-error')
  }
}

export class KatexView implements NodeView {
  dom: HTMLElement
  node: ProseMirrorNode
  renderedLatex: HTMLElement
  editor: Editor
  getPos: boolean | (() => number)
  balloon: KatexBalloon
  editing: boolean
  bindDeselected: (event: Event) => void
  checkboxDisplay: any

  constructor(node: ProseMirrorNode, editor: Editor, getPos: boolean | (() => number)) {
    this.node = node
    this.editor = editor
    this.getPos = getPos
    const { isEditing, display, latexFormula } = this.node.attrs
    this.editing = isEditing

    this.dom = createHTMLElement('span', { contentEditable: 'false', class: 'math-tex tiptap-widget ' }) as HTMLElement
    this.dom.classList.toggle('katex-display', display)

    function confirmBalloon(this: KatexView) {
      this.closeBalloon()
      const { input, checkboxDisplay } = this.balloon
      this.updateAttributes({
        latexFormula: input.value,
        display: checkboxDisplay.checked
      })
      setSelectionAfter(this.editor, this.node)
    }

    function cancelBalloon(this: KatexView) {
      this.cancelEditting()
    }

    this.balloon = new KatexBalloon(
      editor,
      {
        latexFormula,
        display
      },
      confirmBalloon.bind(this),
      cancelBalloon.bind(this),
      BalloonPosition.BOTTOM
    )

    this.renderedLatex = document.createElement('span')
    this.renderedLatex.contentEditable = 'false'
    this.renderedLatex.style.display = 'inline-block'

    if (!this.isEditing()) {
      updateLatexDisplay(this.balloon.input.value, this.renderedLatex)
      this.balloon.preview.innerHTML = this.renderedLatex.innerHTML
    }

    this.bindDeselected = this.deselected.bind(this)
    this.dom.addEventListener('click', (event: Event) => {
      if ((event.target as Element).closest('.balloon-menu') == null) {
        this.selected()
      }
    })

    const balloon = this.balloon.getBalloon()

    this.dom.append(balloon, this.renderedLatex)

    if (this.isEditing()) {
      this.selected()
    }
  }

  updateAttributes(attributes: Record<string, any>) {
    if (typeof this.getPos === 'function') {
      const { view } = this.editor
      const transaction = view.state.tr
      transaction.setNodeMarkup(this.getPos(), undefined, attributes)
      view.dispatch(transaction)
    }
  }

  isEditing() {
    return this.editing
  }

  selectNode() {
    this.dom.classList.add('ex-selected')
  }

  deselectNode() {
    this.dom.classList.remove('ex-selected')
  }

  selected() {
    this.isEditing() || this.dom.classList.add('ex-selected')
    this.editing = true
    this.balloon.input.setSelectionRange(0, 0)
    this.balloon.input.focus()
    window.addEventListener('click', this.bindDeselected)
    this.balloon.show()
  }

  deselected(event: Event) {
    const target = event.target as HTMLElement

    if (target.closest('.math-tex') === null) {
      this.cancelEditting()
    }
  }

  cancelEditting() {
    this.closeBalloon()
    if (this.balloon.input.value.length === 0) {
      this.deleteNode()
    } else {
      this.resetInputs()
    }
  }

  resetInputs() {
    this.balloon.input.value = this.node.attrs.latexFormula
    this.balloon.preview.innerHTML = this.renderedLatex.innerHTML
  }

  closeBalloon() {
    this.balloon.hide()
    this.dom.classList.remove('ex-selected')
    window.removeEventListener('click', this.bindDeselected)
    this.editing = false
  }

  onDestroy() {
    window.removeEventListener('click', this.bindDeselected)
  }

  update(newNode: ProseMirrorNode) {
    if (newNode.type !== this.node.type) {
      return false
    }

    this.node = newNode

    if (!this.isEditing()) {
      const { display, latexFormula } = this.node.attrs
      this.balloon.input.value = latexFormula

      updateLatexDisplay(latexFormula, this.renderedLatex)
      this.dom.classList.toggle('katex-display', display)
    }

    return true
  }

  deleteNode() {
    if (typeof this.getPos === 'function') {
      const pos = this.getPos()
      if (typeof pos !== 'number') return
      const tr = this.editor.view.state.tr

      this.editor.view.dispatch(tr.delete(pos, pos + this.node.nodeSize))
    }
  }

  stopEvent(event: Event) {
    if (event.target != undefined && (event.target as HTMLElement).classList.contains('latex-confirm')) {
      return false
    }

    if (event.type === 'dragstart' && this.isEditing()) {
      event.preventDefault()
    }

    return this.isEditing()
  }
}
