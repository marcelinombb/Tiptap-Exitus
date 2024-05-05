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

  constructor(node: ProseMirrorNode, editor: Editor, getPos: boolean | (() => number)) {
    this.node = node
    this.editor = editor
    this.getPos = getPos

    this.dom = document.createElement('span')
    this.dom.contentEditable = 'false'
    this.dom.className = 'math-tex tiptap-widget '
    this.contentLatex = document.createElement('span')
    this.contentLatex.contentEditable = 'false'

    this.balloon = new Balloon(editor)
    this.input = document.createElement('input')
    this.input.type = 'text'
    this.input.value = this.node.textContent
    this.input.placeholder = '\\sqrt{2}'
    this.balloon.ballonPanel.appendChild(this.input)

    this.contentLatex.appendChild(this.balloon.getBalloon())
    this.renderedLatex = document.createElement('span')
    this.renderedLatex.contentEditable = 'false'

    this.updateLatexDisplay(this.node.textContent, this.renderedLatex)

    if (this.isEditing()) {
      this.balloon.show()
      this.input.focus()
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
    return this.node.attrs.isEditing
  }

  updateLatexDisplay(latex: string, renderLatex: HTMLElement) {
    //contentLatex.style.display = this.isEditing() ? 'inline-block' : 'none'
    //renderLatex.style.display = !this.isEditing() ? 'inline' : 'none'
    const formula = latex

    const matches = parseLatex(formula)

    //contentLatex.innerText = matches

    if (!this.isEditing()) {
      const latexFormula = matches
      //this.balloon.hide()
      try {
        renderLatex.innerHTML = katex.renderToString(latexFormula, {
          output: 'html'
        })
        renderLatex.title = latexFormula
        renderLatex.classList.remove('math-tex-error')
      } catch (error) {
        renderLatex.innerHTML = formula
        renderLatex.classList.add('math-tex-error')
      }
    }
  }

  selectNode() {
    //console.log('selected')

    if (!this.isEditing()) {
      this.balloon.show()
      this.updateAttributes({
        isEditing: true
      })
    }
  }

  deselectNode() {
    this.balloon.hide()
    if (this.isEditing()) {
      this.updateAttributes({
        isEditing: false
        //latexFormula: this.contentLatex.innerText
      })
    }
  }

  update(newNode: ProseMirrorNode) {
    if (newNode.type !== this.node.type) {
      return false
    }

    this.node = newNode

    //console.log('updated')

    this.updateLatexDisplay(this.input.value, this.renderedLatex)

    return true
  }

  ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element }) {
    //console.log(mutation)

    return mutation.type === 'characterData' || mutation.type === 'selection' || mutation.type === 'childList'
  }

  stopEvent(event: Event) {
    /* console.log(event)
    console.log(this.isEditing()) */

    return this.isEditing()
  }
}
