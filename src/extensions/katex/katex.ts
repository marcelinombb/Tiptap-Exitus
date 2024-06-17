//@ts-nocheck
import { type ButtonEventProps } from '@editor/ui'
import formula from '@icons/formula.svg'
import { Node } from '@tiptap/core'
// eslint-disable-next-line import-helpers/order-imports
import { Fragment } from '@tiptap/pm/model'

import '../../../node_modules/katex/dist/katex.css'

import { KatexBalloon, KatexView } from './index'

function click({ editor, button }: ButtonEventProps) {
  const { pos } = editor.state.selection.$anchor

  const main = editor.view.dom.getBoundingClientRect()
  const { bottom, left } = editor.view.coordsAtPos(pos)

  if (button.active()) {
    return
  }

  button.on()

  const confirmButtonCallback = (katexBalloon: KatexBalloon) => {
    const { input, checkboxDisplay } = katexBalloon
    if (input.value === '') return
    editor.commands.insertContentAt(pos, `<span class="math-tex ${checkboxDisplay.checked ? 'katex-display' : ''}">${input.value}</span>`, {
      updateSelection: true,
      parseOptions: {
        preserveWhitespace: true
      }
    })
    cancelButtonCallback(katexBalloon)
  }

  const cancelButtonCallback = (katexBalloon: KatexBalloon) => {
    button.off()
    editor.editorMainDiv.removeChild(katexBalloon.getBalloon())
  }

  const balloon = new KatexBalloon(
    editor,
    {
      latexFormula: '',
      display: false
    },
    confirmButtonCallback,
    cancelButtonCallback,
    'float'
  )

  const focus = () => {
    button.off()
    editor.off('focus', focus)
    try {
      editor.editorMainDiv.removeChild(balloon.getBalloon())
    } catch (e) {}
  }

  editor.on('focus', focus)

  editor.editorMainDiv.appendChild(balloon.getBalloon())
  balloon.balloon.setPosition(left - main.left, bottom - main.y)
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
        click: click,
        checkActive: this.name,
        tooltip: 'Fórmulas Latex'
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
