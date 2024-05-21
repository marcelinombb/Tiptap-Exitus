import { type ButtonEventProps } from '@editor/ui'
import formula from '@icons/formula.svg'
import { Node } from '@tiptap/core'
// eslint-disable-next-line import-helpers/order-imports
import { Fragment } from '@tiptap/pm/model'

import '../../../node_modules/katex/dist/katex.css'

import { KatexView } from './katexView'

function createRedSquare(top: number, left: number, color: string) {
  // Create the div element
  const div = document.createElement('div')

  // Set the style properties
  div.style.width = '10px'
  div.style.height = '10px'
  div.style.backgroundColor = color
  div.style.position = 'absolute'
  div.style.top = `${top}px`
  div.style.left = `${left}px`

  // Append the div to the body or another container
  return div
}

function click({ editor }: ButtonEventProps) {
  const { nodeBefore, pos } = editor.state.selection.$anchor

  //const { state, view } = editor

  //console.log(nodeBefore, nodeAfter, pos)
  /*   const after = editor.view.coordsAtPos(pos - 1, -1)
  const before = editor.view.coordsAtPos(pos + 1, 1)
  const main = editor.view.dom.getBoundingClientRect()
  console.log(pos, { right: before.right, top: before.top }, { right: after.right, top: after.top }) */

  //console.log(editor.view.coordsAtPos(pos, 1), editor.view.coordsAtPos(pos, -1))

  //editor.editorMainDiv.appendChild(createRedSquare(after.top, after.left, 'red'))
  //editor.editorMainDiv.appendChild(createRedSquare(before.top, before.left, 'green'))

  //editor.editorMainDiv.appendChild(createRedSquare(before.top - main.y, before.left - main.left, 'blue'))
  //document.body.appendChild(createRedSquare(top, left))

  if (nodeBefore?.type.name == 'katex' && nodeBefore.attrs.isEditing) {
    return
  }

  editor.commands.insertContentAt(pos, `<span class="math-tex" isEditing='true'> </span>`, {
    updateSelection: true,
    parseOptions: {
      preserveWhitespace: true
    }
  })
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
          return (node as HTMLElement).classList.contains('math-tex') && null
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
