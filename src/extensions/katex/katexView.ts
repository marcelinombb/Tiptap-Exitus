import { type Editor } from '@tiptap/core'
import { type Node as ProseMirrorNode } from '@tiptap/pm/model'
import { type NodeView } from '@tiptap/pm/view'
import katex from 'katex'

import { parseLatex } from './katex'

export class KatexView implements NodeView {
  dom: Element
  node: ProseMirrorNode
  contentLatex: HTMLElement
  renderedLatex: HTMLElement
  contentDOM?: HTMLElement | null | undefined
  editor: Editor
  getPos: boolean | (() => number)
  bindClickOutside: (event: Event) => void
  constructor(node: ProseMirrorNode, editor: Editor, getPos: boolean | (() => number)) {
    this.node = node
    this.editor = editor
    this.getPos = getPos
    this.bindClickOutside = this.outsideClick.bind(this)

    this.dom = document.createElement('div')
    this.dom.className = 'math-tex tiptap-widget '
    this.contentLatex = document.createElement('div')
    this.contentLatex.className = 'latex-editor'
    this.contentLatex.contentEditable = 'true'
    this.contentDOM = this.contentLatex
    this.renderedLatex = document.createElement('div')
    this.renderedLatex.contentEditable = 'false'

    this.updateLatexDisplay(this.node.textContent, this.contentLatex, this.renderedLatex)

    this.dom.addEventListener('click', event => {
      event.stopPropagation()

      this.updateAttributes({
        isEditing: true
      })

      window.addEventListener('click', this.bindClickOutside)
    })

    this.dom.append(this.contentLatex, this.renderedLatex)
  }

  private outsideClick(event: Event) {
    const target = event.target as HTMLElement
    if (target.classList.contains('math-tex') || target.parentElement?.classList?.contains('math-tex')) return
    this.updateAttributes({
      isEditing: false,
      latexFormula: this.contentLatex.innerText
    })
    window.removeEventListener('click', this.bindClickOutside)
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

  update(newNode: ProseMirrorNode) {
    if (newNode.type !== this.node.type) {
      return false
    }

    this.node = newNode

    this.updateLatexDisplay(this.contentLatex.innerText, this.contentLatex, this.renderedLatex)

    return true
  }

  ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element }) {
    return mutation.type === 'selection' || mutation.type === 'childList'
  }

  stopEvent() {
    return this.node.attrs.isEditing
  }
}
