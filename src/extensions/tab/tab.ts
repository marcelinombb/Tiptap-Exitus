//@ts-nocheck
import { type Editor, Node, NodePos } from '@tiptap/core'

function addTab(editor: Editor) {
  return editor.commands.insertContentAt(editor.view.state.selection.$anchor.pos, '<span>        </span>', {
    updateSelection: true,
    parseOptions: {
      preserveWhitespace: 'full'
    }
  })
}

export const Tab = Node.create({
  name: 'teclatab',

  group: 'inline',

  inline: true,

  content: 'text*',

  atom: true,

  addCommands() {
    return {
      tabIndent:
        () =>
        ({ tr, state, dispatch, editor }) => {
          const { selection } = state
          tr = tr.setSelection(selection)
          tr = addTab(tr, editor)

          if (tr.docChanged) {
            // eslint-disable-next-line no-unused-expressions
            dispatch && dispatch(tr)
            return true
          }

          editor.chain().focus().run()

          return false
        },
      tabOutdent: () => () => {
        return true
      }
    }
  },
  parseHTML() {
    return [
      {
        tag: 'span'
      }
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },
  addAttributes() {
    return {
      class: {
        default: ''
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (!(this.editor.isActive('bulletList') || this.editor.isActive('orderedList'))) {
          return addTab(this.editor)
        }
        return false
      },
      'Shift-Tab': () => {
        if (!(this.editor.isActive('bulletList') || this.editor.isActive('orderedList'))) {
          const pos = this.editor.view.state.selection.$anchor
          console.log(pos)

          const myNodePos = new NodePos(pos, this.editor)
          console.log(myNodePos.before)
        }
        return false
      }
    }
  }
})
