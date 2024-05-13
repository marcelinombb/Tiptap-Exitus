import { Balloon, Button } from '@editor/ui'
import { createHTMLElement } from '@editor/utils'
import check from '@icons/check-line.svg'
import close from '@icons/close-line.svg'
import { type Editor } from '@tiptap/core'
import { type Node as ProseMirrorNode } from '@tiptap/pm/model'
import { type NodeView } from '@tiptap/pm/view'
import katex from 'katex'

import { parseLatex } from './katex'

export class KatexView implements NodeView {
  dom: HTMLElement
  node: ProseMirrorNode
  renderedLatex: HTMLElement
  editor: Editor
  getPos: boolean | (() => number)
  balloon: Balloon
  input: HTMLInputElement
  editing: boolean
  bindDeselected: (event: Event) => void
  preview: Element
  checkboxDisplay: any

  constructor(node: ProseMirrorNode, editor: Editor, getPos: boolean | (() => number)) {
    this.node = node
    this.editor = editor
    this.getPos = getPos
    const { isEditing, display, latexFormula } = this.node.attrs
    this.editing = isEditing

    this.dom = createHTMLElement('span', { contentEditable: 'false', class: 'math-tex tiptap-widget ' }) as HTMLElement
    this.dom.classList.toggle('katex-display', display)

    this.balloon = new Balloon(editor, {
      arrow: 'top'
    })

    this.input = createHTMLElement('input', {
      type: 'text',
      class: 'latex-input-text',
      value: latexFormula.trim(),
      placeholder: '\\sqrt{2}',
      contentEditable: 'true'
    }) as HTMLInputElement

    this.checkboxDisplay = createHTMLElement('input', { type: 'checkbox', checked: display, id: 'emBloco' })
    this.checkboxDisplay.checked = display

    this.preview = createHTMLElement('div', { class: 'latex-editting-preview' })
    this.preview.classList.toggle('katex-display', display)

    this.input.addEventListener('keyup', () => {
      this.updateLatexDisplay(this.input.value, this.preview)
      this.preview.classList.toggle('katex-display', this.checkboxDisplay.checked)
    })

    this.checkboxDisplay.addEventListener('change', () => {
      this.preview.classList.toggle('katex-display', this.checkboxDisplay.checked)
    })

    const confirmButton = new Button(editor, {
      label: check,
      classList: ['latex-confirm']
    })

    confirmButton.bind('click', () => {
      this.closeBalloon()

      this.updateAttributes({
        latexFormula: this.input.value,
        display: this.checkboxDisplay.checked
      })
    })

    const cancelButton = new Button(editor, {
      label: close,
      classList: ['latex-cancel']
    })

    cancelButton.bind('click', () => {
      this.cancelEditting()
    })

    const inputDisplay = createHTMLElement('div', { class: 'latex-editting-input' }, [this.input, confirmButton.render(), cancelButton.render()])

    const label = createHTMLElement('label', { for: 'emBloco', class: 'checkbox-label' })
    label.textContent = 'Em Bloco'

    const displayCheckbox = createHTMLElement('div', { class: 'latex-editting-displayCheckbox' }, [label, this.checkboxDisplay])

    const divConteiner = createHTMLElement('div', { class: 'latex-editting-container' }, [inputDisplay, displayCheckbox, this.preview])

    this.balloon.ballonPanel.appendChild(divConteiner)

    this.renderedLatex = document.createElement('span')
    this.renderedLatex.contentEditable = 'false'
    this.renderedLatex.style.display = 'inline-block'

    if (!this.isEditing()) {
      this.updateLatexDisplay(this.input.value, this.renderedLatex)
      this.preview.innerHTML = this.renderedLatex.innerHTML
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

  updateLatexDisplay(latex: string, containerDisplay: Element) {
    const formula = latex

    const matches = parseLatex(formula)

    const latexFormula = matches
    try {
      containerDisplay.innerHTML = katex.renderToString(latexFormula, {
        output: 'html'
      })

      containerDisplay.classList.remove('math-tex-error')
    } catch (error) {
      containerDisplay.innerHTML = formula
      containerDisplay.classList.add('math-tex-error')
    }
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
    this.input.setSelectionRange(0, 0)
    this.input.focus()
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
    if (this.input.value.length === 0) {
      this.deleteNode()
    } else {
      this.resetInputs()
    }
  }

  resetInputs() {
    this.input.value = this.node.attrs.latexFormula
    this.preview.innerHTML = this.renderedLatex.innerHTML
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
      this.input.value = latexFormula

      this.updateLatexDisplay(latexFormula, this.renderedLatex)
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
    if ((event.target as HTMLElement).classList.contains('latex-confirm')) {
      return false
    }

    if (event.type === 'dragstart' && this.isEditing()) {
      event.preventDefault()
    }

    return this.isEditing()
  }
}
