import { Balloon, Button } from '@editor/ui'
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
  preview: HTMLDivElement
  checkboxDisplay: any

  constructor(node: ProseMirrorNode, editor: Editor, getPos: boolean | (() => number)) {
    this.node = node
    this.editor = editor
    this.getPos = getPos
    const { isEditing, display, latexFormula } = this.node.attrs
    this.editing = isEditing

    this.dom = document.createElement('span')
    this.dom.contentEditable = 'false'
    this.dom.className = 'math-tex tiptap-widget '
    this.dom.classList.toggle('katex-display', display)

    this.balloon = new Balloon(editor, {
      arrow: 'top'
    })

    const divConteiner = document.createElement('div')
    divConteiner.className = 'latex-editting-container'

    this.input = document.createElement('input')
    this.input.type = 'text'
    this.input.className = 'latex-input-text'
    this.input.value = latexFormula.trim()
    this.input.placeholder = '\\sqrt{2}'
    this.input.contentEditable = 'true'

    this.checkboxDisplay = document.createElement('input')
    this.checkboxDisplay.type = 'checkbox'
    this.checkboxDisplay.checked = display

    const inputDisplay = document.createElement('div')
    inputDisplay.className = 'latex-editting-input'
    inputDisplay.append(this.input, this.checkboxDisplay)

    this.preview = document.createElement('div')
    this.preview.className = 'latex-editting-preview'
    this.preview.classList.toggle('katex-display', display)

    this.input.addEventListener('keyup', () => {
      this.updateLatexDisplay(this.input.value, this.preview)
      this.preview.classList.toggle('katex-display', this.checkboxDisplay.checked)
    })

    this.checkboxDisplay.addEventListener('change', () => {
      //console.log(this.checkboxDisplay.checked)
      this.preview.classList.toggle('katex-display', this.checkboxDisplay.checked)
    })

    const confirmButton = new Button(editor, {
      label: 'inserir',
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
      label: 'cancelar',
      classList: ['latex-cancel']
    })

    cancelButton.bind('click', () => {
      this.cancelEdit()
    })

    const footer = document.createElement('div')
    footer.className = 'latex-editting-footer'
    footer.append(confirmButton.render(), cancelButton.render())

    divConteiner.append(inputDisplay, this.preview, footer)

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

  updateLatexDisplay(latex: string, containerDisplay: HTMLElement) {
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
      this.cancelEdit()
    }
  }

  cancelEdit() {
    this.closeBalloon()
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
