import { type ButtonEventProps } from '@editor/ui'
import formula from '@icons/formula.svg'
import { Node } from '@tiptap/core'
import { Fragment } from '@tiptap/pm/model'
//import katex from 'katex'

// -disable-next-line import/no-unresolved
import '../../../node_modules/katex/dist/katex.css'
import { KatexView } from './katexView'

function click({ editor }: ButtonEventProps) {
  editor.commands.insertContentAt(editor.view.state.selection.$anchor.pos, `<span class="math-tex" isEditing='true' >\\sqrt{2}</span>`, {
    updateSelection: true,
    parseOptions: {
      preserveWhitespace: 'full'
    }
  })
}

/* function updateAttributes(editor: Editor, getPos: boolean | (() => number), attributes: Record<string, any>) {
  if (typeof getPos === 'function') {
    const { view } = editor
    const transaction = view.state.tr
    transaction.setNodeMarkup(getPos(), undefined, attributes)
    view.dispatch(transaction)
  }
} */

export const Katex = Node.create({
  name: 'katex',

  group: 'inline',

  draggable: true,

  inline: true,

  atom: true,

  content: 'inline*',

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
        getContent: (dom, schema) => {
          const data = dom.textContent as string
          return Fragment.from(schema.text(parseLatex(data)))
        },
        priority: 9999
      }
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', { class: 'math-tex' }, HTMLAttributes.latexFormula]
  },
  addAttributes() {
    return {
      class: {
        default: ''
      },
      isEditing: {
        default: false,
        parseHTML(element) {
          return element.getAttribute('isEditing') !== null
        }
      },
      latexFormula: {
        default: '',
        parseHTML(element) {
          return element.innerText
        }
      }
    }
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      return new KatexView(node, editor, getPos)
    }
  }
  /* addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div')
      dom.className = 'math-tex tiptap-widget '
      const contentLatex = document.createElement('div')
      contentLatex.className = 'latex-editor'
      contentLatex.contentEditable = 'true'

      const renderedLatex = document.createElement('div')
      renderedLatex.contentEditable = 'false'

      updateLatexDisplay(node.textContent, node, contentLatex, renderedLatex)

      dom.addEventListener('click', event => {
        event.stopPropagation()

        //if (node.attrs.isEditing) {
        updateAttributes(editor, getPos, {
          isEditing: true
        })
        //}

        function outsideClick(event: Event) {
          const target = event.target as HTMLElement
          if (target.classList.contains('math-tex') || target.parentElement?.classList?.contains('math-tex')) return
          updateAttributes(editor, getPos, {
            isEditing: false,
            latexFormula: contentLatex.innerText
          })
          window.removeEventListener('click', outsideClick)
        }

        window.addEventListener('click', outsideClick)
      })

      dom.append(contentLatex, renderedLatex)

      return {
        dom,
        update(newNode) {
          if (newNode.type !== node.type) {
            return false
          }
          //console.log(newNode.attrs, node.attrs)
          node = newNode
          updateLatexDisplay(contentLatex.innerText, newNode, contentLatex, renderedLatex)

          return true
        },
        stopEvent(event) {
          return node.attrs.isEditing
        }
      }
    }
  } */
})

/* function updateLatexDisplay(latex: string, node: ProseMirrorNode, contentLatex: HTMLElement, renderLatex: HTMLElement) {
  contentLatex.style.display = node.attrs.isEditing ? 'inline-block' : 'none'
  renderLatex.style.display = !node.attrs.isEditing ? 'inline' : 'none'
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
} */

export function parseLatex(text: string) {
  const regex = /\\\((.*?)\\\)/g
  //const matches = []
  let match

  let parsedData = text
  while ((match = regex.exec(text)) !== null) {
    parsedData = parsedData.replace(match[0], match[1])
    //matches.push(match[1])
  }

  return parsedData
}
