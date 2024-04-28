import formula from '@icons/formula.svg'
import { type Editor, Node } from '@tiptap/core'
import { type Node as ProseMirrorNode } from '@tiptap/pm/model'
import katex from 'katex'
// -disable-next-line import/no-unresolved
import '../../../node_modules/katex/dist/katex.css'

import { type ButtonEventProps } from '@editor/ui'

function click({ editor }: ButtonEventProps) {
  editor.commands.insertContentAt(editor.view.state.selection.$anchor.pos, `<span class="math-tex"></span>`, {
    updateSelection: true,
    parseOptions: {
      preserveWhitespace: 'full'
    }
  })
}

function updateAttributes(editor: Editor, getPos: boolean | (() => number), attributes: Record<string, any>) {
  if (typeof getPos === 'function') {
    const { view } = editor
    view.dispatch(view.state.tr.setNodeMarkup(getPos(), undefined, attributes))
  }
}

export const Katex = Node.create({
  name: 'katex',

  group: 'inline',

  //draggable: true,

  inline: true,

  //isolating: true,

  content: 'inline*',

  //atom: true,

  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: formula,
        events: {
          click: click
        },
        checkActive: this.name
      }
    }
  },
  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: node => {
          return (node as HTMLElement).className === 'math-tex' && null
        },
        priority: 9999
      }
    ]
  },
  renderHTML({}) {
    return ['span', { class: 'math-tex' }, 0]
  },
  addAttributes() {
    return {
      class: {
        default: ''
      },
      isEditing: {
        default: false
      }
    }
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div')
      dom.className = 'math-tex tiptap-widget '
      const contentLatex = document.createElement('div')
      contentLatex.className = 'latex-editor'
      const renderedLatex = document.createElement('div')

      contentLatex.contentEditable = 'true'

      updateLatexDisply(node, contentLatex, renderedLatex)

      dom.addEventListener('click', event => {
        event.stopPropagation()

        updateAttributes(editor, getPos, {
          isEditing: true
        })

        function outsideClick(event: Event) {
          const target = event.target as HTMLElement
          if (target.classList.contains('math-tex') || target.parentElement?.classList?.contains('math-tex')) return
          updateAttributes(editor, getPos, {
            isEditing: false
          })
          window.removeEventListener('click', outsideClick)
        }

        window.addEventListener('click', outsideClick)
      })

      dom.append(contentLatex, renderedLatex)

      return {
        dom,
        contentDOM: contentLatex,
        update(newNode) {
          if (newNode.type !== node.type) {
            return false
          }
          updateLatexDisply(newNode, contentLatex, renderedLatex)
          node = newNode

          return true
        },
        selectNode() {
          console.log('selected')
        },
        ignoreMutation(mutation) {
          return true
        }
      }
    }
  }
})

function updateLatexDisply(node: ProseMirrorNode, contentLatex: HTMLElement, renderLatex: HTMLElement) {
  contentLatex.style.display = node.attrs.isEditing ? 'inline-block' : 'none'
  renderLatex.style.display = !node.attrs.isEditing ? 'inline' : 'none'
  const formula = node.textContent as string

  const matches = parseLatex(formula)

  const latexFormula = matches.join('')

  try {
    renderLatex.innerHTML = katex.renderToString(latexFormula, {
      output: 'html'
    })
  } catch (error) {
    renderLatex.innerHTML = formula
  }
}

function parseLatex(text: string) {
  const regex = /\\\((.*?)\\\)/g
  const matches = []
  let match

  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1])
  }

  if (matches.length == 0) return [text]

  return matches
}
