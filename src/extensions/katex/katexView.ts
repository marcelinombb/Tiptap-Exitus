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
  isDragging: boolean = false

  constructor(node: ProseMirrorNode, editor: Editor, getPos: boolean | (() => number)) {
    this.node = node
    this.editor = editor
    this.getPos = getPos
    this.editing = true

    this.dom = document.createElement('span')
    this.dom.contentEditable = 'false'
    this.dom.className = 'math-tex tiptap-widget '

    this.balloon = new Balloon(editor, {
      arrow: 'top'
    })

    this.input = document.createElement('input')
    this.input.type = 'text'
    this.input.className = 'latex-input-text'
    this.input.value = this.node.attrs.latexFormula.trim()
    this.input.placeholder = '\\sqrt{2}'

    const checkboxDisplay = document.createElement('input')
    checkboxDisplay.type = 'checkbox'

    const divConteiner = document.createElement('div')
    divConteiner.className = 'latex-editting-container'

    const inputDisplay = document.createElement('div')
    inputDisplay.className = 'latex-editting-input'
    inputDisplay.append(this.input, checkboxDisplay)

    const preview = document.createElement('div')
    preview.className = 'latex-editting-preview'

    this.input.addEventListener('keyup', (event: Event) => {
      //console.log('changed')
      //console.log(event.target.value)

      this.updateLatexDisplay(this.input.value, preview)
    })

    const confirmButton = new Button(editor, {
      label: 'inserir',
      events: {
        click: () => {}
      }
    })

    const cancelButton = new Button(editor, {
      label: 'cancelar',
      events: {
        click: () => {}
      }
    })

    const footer = document.createElement('div')
    footer.className = 'latex-editting-footer'
    footer.append(confirmButton.render(), cancelButton.render())

    divConteiner.append(inputDisplay, preview, footer)

    this.balloon.ballonPanel.appendChild(divConteiner)

    this.renderedLatex = document.createElement('span')
    this.renderedLatex.contentEditable = 'false'

    if (!this.node.attrs.isEditing) {
      this.editing = false
      this.updateLatexDisplay(this.input.value, this.renderedLatex)
      preview.innerHTML = this.renderedLatex.innerHTML
    }

    this.bindDeselected = this.deselected.bind(this)
    this.dom.addEventListener('click', this.selected.bind(this))

    if (this.isEditing()) {
      this.selected()
    }

    this.dom.append(this.balloon.getBalloon(), this.renderedLatex)
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
      containerDisplay.title = latexFormula
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
    if (this.isDragging) return

    this.balloon.show()
    this.isEditing() || this.dom.classList.add('ex-selected')
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
      this.updateLatexDisplay(this.input.value, this.renderedLatex)
    }

    return true
  }

  stopEvent(event: Event) {
    /* if (event.target == this.input && event instanceof KeyboardEvent) {
      console.log(event.type, event instanceof KeyboardEvent)
      return false
    } */

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
