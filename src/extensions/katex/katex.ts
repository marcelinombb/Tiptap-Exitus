import { InputRule, Node } from '@tiptap/core'
import { Fragment } from '@tiptap/pm/model'
import '../../../node_modules/katex/dist/katex.min.css'

import { KatexView } from './index'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    katex: {
      addLatexInput: () => ReturnType
    }
  }
}

export const Katex = Node.create({
  name: 'katex',

  group: 'inline',

  inline: true,

  atom: true,

  content: 'inline*',

  draggable: true,

  addInputRules() {
    return [
      new InputRule({
        find: /\$\$([\s\S]+?)\$\$$/,
        handler: ({ state, range, match }) => {
          const latex = match[1]
          const { tr } = state
          const start = range.from
          const end = range.to
          tr.replaceWith(start, end, this.type.create({ latexFormula: parseLatex(latex) }))
        }
      })
    ]
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: node => {
          return (node as HTMLElement).classList.contains('math-tex') && null
        },
        getContent: (dom, schema) => {
          const data = dom.textContent as string
          return Fragment.from(schema.text(parseLatex(data)))
        },
        priority: 80
      }
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', { class: 'math-tex' }, `\\(${HTMLAttributes.latexFormula}\\)`]
  },
  addCommands() {
    return {
      addLatexInput:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              isEditing: false,
              latexFormula: ''
            }
          })
        }
    }
  },
  addAttributes() {
    return {
      class: {
        default: 'math-tex'
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
          return parseLatex(element.innerText)
        }
      },
      display: {
        default: false,
        parseHTML: element => {
          return element.classList.contains('katex-display')
        }
      }
    }
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      return new KatexView(node, editor, getPos)
    }
  }
})

export function parseLatex(text: string) {
  const regex = /\\\((.*?)\\\)/g
  let match

  let parsedData = text
  while ((match = regex.exec(text)) !== null) {
    parsedData = parsedData.replace(match[0], match[1])
  }

  return parsedData
}
