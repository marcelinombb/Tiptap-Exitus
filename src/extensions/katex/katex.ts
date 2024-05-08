import { type ButtonEventProps } from '@editor/ui'
import formula from '@icons/formula.svg'
import { Node } from '@tiptap/core'
// eslint-disable-next-line import-helpers/order-imports
import { Fragment } from '@tiptap/pm/model'

import '../../../node_modules/katex/dist/katex.css'

import { KatexView } from './katexView'

function click({ editor }: ButtonEventProps) {
  const { nodeBefore } = editor.state.selection.$anchor

  if (nodeBefore?.type.name == 'katex' && nodeBefore.attrs.isEditing) {
    return
  }

  editor.commands.insertContent(`<span class="math-tex" isEditing='true' > </span>`)
}

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
