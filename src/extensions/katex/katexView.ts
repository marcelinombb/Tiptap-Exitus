import { type Editor } from '@tiptap/core'
import { type Node as ProseMirrorNode } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'
import { type NodeView } from '@tiptap/pm/view'
import katex from 'katex'

import { parseLatex } from './katex'

export class KatexView implements NodeView {
  dom: HTMLElement
  node: ProseMirrorNode
  contentLatex: HTMLElement
  renderedLatex: HTMLElement
  contentDOM?: HTMLElement | null | undefined
  editor: Editor
  getPos: boolean | (() => number)
  constructor(node: ProseMirrorNode, editor: Editor, getPos: boolean | (() => number)) {
    this.node = node
    this.editor = editor
    this.getPos = getPos

    this.dom = document.createElement('span')
    this.dom.contentEditable = 'false'
    this.dom.className = 'math-tex tiptap-widget '
    this.contentLatex = document.createElement('span')
    this.contentLatex.className = 'latex-editor'
    this.contentLatex.contentEditable = 'true'
    this.contentDOM = this.contentLatex
    this.renderedLatex = document.createElement('span')
    this.renderedLatex.contentEditable = 'false'

    this.updateLatexDisplay(this.node.textContent, this.contentLatex, this.renderedLatex)

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

  updateLatexDisplay(latex: string, contentLatex: HTMLElement, renderLatex: HTMLElement) {
    contentLatex.style.display = this.node.attrs.isEditing ? 'inline-block' : 'none'
    renderLatex.style.display = !this.node.attrs.isEditing ? 'inline' : 'none'
    const formula = latex

    const matches = parseLatex(formula)

    contentLatex.innerText = matches

    const latexFormula = matches

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

  selectNode() {
    console.log('selected')
    const { tr } = this.editor.view.state
    const pos = this.getPos()
    const resolvedPos = tr.doc.resolve(pos + 1) // Adjust for node start position

    //if (!tr.selection.) {
    // Set the selection to the start of the node content
    tr.setSelection(TextSelection.near(resolvedPos))
    this.editor.view.dispatch(tr)
    //}

    this.updateAttributes({
      isEditing: true
    })
  }

  deselectNode() {
    console.log('deselected')
    if (this.node.attrs.isEditing) {
      this.updateAttributes({
        isEditing: false,
        latexFormula: this.contentLatex.innerText
      })
    }
  }

  update(newNode: ProseMirrorNode) {
    console.log('update')
    if (newNode.type !== this.node.type) {
      return false
    }

    this.node = newNode

    this.updateLatexDisplay(this.contentLatex.innerText, this.contentLatex, this.renderedLatex)

    return true
  }

  ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element }) {
    console.log(mutation)

    return mutation.type === 'characterData' || mutation.type === 'selection' || mutation.type === 'childList'
  }

  stopEvent(event: Event) {
    console.log(event)

    return this.node.attrs.isEditing
  }
}
