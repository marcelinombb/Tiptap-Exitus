import { debounce } from '@editor/utils'
import { type Editor, InputRule, Node } from '@tiptap/core'
import { Fragment } from '@tiptap/pm/model'
import '../../../node_modules/katex/dist/katex.min.css'
import { type EditorView } from '@tiptap/pm/view'

import { KatexView } from './index'

const latexRegex = /\$\$([\s\S]+?)\$\$/g

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    katex: {
      addLatexInput: () => ReturnType
    }
  }
}

export type KatexOptions = {
  debounceFn: (editor: Editor) => void
}

export const Katex = Node.create<KatexOptions>({
  name: 'katex',

  group: 'inline',

  inline: true,

  atom: true,

  content: 'inline*',

  draggable: true,

  addOptions() {
    return {
      debounceFn: debounce((editor: Editor) => {
        normalizeLatex(editor.view)
      }, 300)
    }
  },

  addInputRules() {
    return [
      new InputRule({
        find: latexRegex,
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
  },

  onCreate() {
    normalizeLatex(this.editor.view)
  },

  onTransaction({ editor }) {
    this.options.debounceFn(editor)
  }
})

function normalizeLatex(view: EditorView) {
  const { state, dispatch } = view
  const tr = state.tr
  let changed = false

  state.doc.descendants((node, pos) => {
    if (node.isText) {
      const text = node.text
      if (!text) return

      let match
      let offset = 0

      while ((match = latexRegex.exec(text))) {
        const from = pos + match.index - offset
        const to = from + match[0].length

        tr.replaceWith(from, to, state.schema.nodes.katex.create({ latexFormula: match[1].trim() }))

        offset += match[0].length - 1
        changed = true
      }
    }
  })

  if (changed) dispatch(tr)
}

export function parseLatex(text: string) {
  const regex = /\\\((.*?)\\\)/g
  let match

  let parsedData = text
  while ((match = regex.exec(text)) !== null) {
    parsedData = parsedData.replace(match[0], match[1])
  }

  return parsedData
}
