import { type ButtonEventProps } from '@editor/ui'
import formula from '@icons/formula.svg'
import { Node } from '@tiptap/core'
// eslint-disable-next-line import-helpers/order-imports
import { Fragment } from '@tiptap/pm/model'

import '../../../node_modules/katex/dist/katex.css'
import { TextSelection } from '@tiptap/pm/state'

import { KatexView } from './katexView'

function click({ editor }: ButtonEventProps) {
  console.log(editor.view.coordsAtPos(editor.view.state.selection.$anchor.pos))

  editor
    .chain()
    .insertContent(`<span class="math-tex" isEditing='true' >\\sqrt{2}</span>`)
    .command(({ tr, dispatch }) => {
      if (dispatch) {
        let position = tr.selection.to
        position = position - 1 // Adjust this depending on where you want the cursor within the node
        const selection = TextSelection.create(tr.doc, position)
        tr.setSelection(selection)
        dispatch(tr)
      }
      return true
    })
    .focus()
    .run()
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
  /* addCommands() {
    return {
      addLatexInput:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            let position = tr.selection.to
            position = position - 1 // Adjust this depending on where you want the cursor within the node
            const selection = TextSelection.create(tr.doc, position)
            tr.setSelection(selection)
            dispatch(tr)
          }
          return true
        }
    }
  }, */
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
})

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
