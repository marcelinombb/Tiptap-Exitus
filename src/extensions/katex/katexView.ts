import { Balloon } from '@editor/ui'
import { type Editor } from '@tiptap/core'
import { type Node as ProseMirrorNode } from '@tiptap/pm/model'
import { type NodeView } from '@tiptap/pm/view'
import katex from 'katex'

import { parseLatex } from './katex'

export class KatexView implements NodeView {
  dom: HTMLElement
  node: ProseMirrorNode
  contentLatex: HTMLElement
  renderedLatex: HTMLElement
  editor: Editor
  getPos: boolean | (() => number)
  balloon: Balloon
  input: HTMLInputElement
  editing: boolean
  bindDeselected: (event: Event) => void
  isDragging: boolean = false

  constructor(node: ProseMirrorNode, editor: Editor, getPos: boolean | (() => number)) {
    this.node = node
    this.editor = editor
    this.getPos = getPos
    this.editing = true

    this.dom = document.createElement('span')
    this.dom.contentEditable = 'false'
    this.dom.className = 'math-tex tiptap-widget '
    this.contentLatex = document.createElement('span')
    this.contentLatex.contentEditable = 'false'

    this.balloon = new Balloon(editor)

    this.dom.appendChild(this.contentLatex)

    this.input = document.createElement('input')
    this.input.type = 'text'
    this.input.value = this.node.attrs.latexFormula.trim()
    this.input.placeholder = '\\sqrt{2}'
    //this.input.contentEditable = 'true'
    this.balloon.ballonPanel.appendChild(this.input)

    this.contentLatex.appendChild(this.balloon.getBalloon())
    this.renderedLatex = document.createElement('span')
    this.renderedLatex.contentEditable = 'false'

    if (!this.node.attrs.isEditing) {
      this.editing = false
      this.updateLatexDisplay(this.input.value)
    }

    this.bindDeselected = this.deselected.bind(this)
    this.dom.addEventListener('click', this.selected.bind(this))

    if (this.isEditing()) {
      this.selected()
    }

    this.dom.append(this.contentLatex, this.renderedLatex)
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

  updateLatexDisplay(latex: string) {
    const formula = latex

    const matches = parseLatex(formula)

    const latexFormula = matches
    try {
      this.renderedLatex.innerHTML = katex.renderToString(latexFormula, {
        output: 'html'
      })
      this.renderedLatex.title = latexFormula
      this.renderedLatex.classList.remove('math-tex-error')
    } catch (error) {
      this.renderedLatex.innerHTML = formula
      this.renderedLatex.classList.add('math-tex-error')
    }
  }

  selected() {
    console.log('selected')
    if (this.isDragging) return

    this.balloon.show()
    this.dom.classList.add('ex-selected')
    this.editing = true
    window.addEventListener('click', this.bindDeselected)
  }

  deselected(event: Event) {
    const target = event.target as HTMLElement
    if (target.closest('.math-tex') === null) {
      this.balloon.hide()
      this.dom.classList.remove('ex-selected')
      window.removeEventListener('click', this.bindDeselected)
      this.editing = false
      this.updateAttributes({
        latexFormula: this.input.value
      })
    }
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
      this.input.value = this.node.attrs.latexFormula
      this.updateLatexDisplay(this.input.value)
    }

    return true
  }

  stopEvent(event: Event) {
    if (event.type === 'dragstart') {
      this.isDragging = true
    }

    if (event.type === 'dragend') {
      this.isDragging = false
      return false
    }

    return this.isEditing()
  }
}
