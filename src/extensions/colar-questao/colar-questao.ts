import { type Editor, mergeAttributes, Node } from '@tiptap/core'
import { type Node as PmNode } from '@tiptap/pm/model'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    colarQuestao: {
      addColarQuestao: (title: string) => ReturnType
      removeColarQuestao: () => ReturnType
    }
  }
}

export const ColarQuestao = Node.create({
  name: 'colarQuestao',

  group: 'block',

  content: 'block+',

  draggable: true,

  selectable: true,

  allowGapCursor: true,

  parseHTML() {
    return [
      {
        tag: 'colar-questao'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['colar-questao', mergeAttributes(HTMLAttributes), 0]
  },

  addAttributes() {
    return {
      title: {
        default: null
      }
    }
  },

  addCommands() {
    return {
      addColarQuestao: (title: string) => {
        return ({ editor, commands, tr, dispatch, state }) => {
          //const selectedNode = isSelectionWithinNode(editor, this.name)
          const { from, to } = state.selection
          const slice = state.doc.slice(from, to)
          //console.log(slice)

          const colarNode = state.schema.nodes.colarQuestao.create({ title }, slice.content)

          const transaction = tr.replaceRangeWith(from, to, colarNode)

          if (dispatch) {
            dispatch(transaction)
            return true
          }

          return false

          /* if (selectedNode) {
            const [node, pos] = selectedNode

            if (node.attrs.title === title) return false

            if (dispatch) {
              tr.setNodeMarkup(pos, undefined, { title })
              dispatch(tr)
            }
            return true
          } else {
            return commands.wrapIn(this.name, { title })
          } */
        }
      },
      removeColarQuestao: () => {
        return ({ editor, dispatch, tr }) => {
          const selectedNode = isSelectionWithinNode(editor, this.name)

          if (selectedNode) {
            const [node, pos] = selectedNode
            const content = node.content
            tr.replaceWith(pos, pos + node.nodeSize, content)
          }

          if (dispatch) {
            dispatch(tr)
            return true
          }

          return false
        }
      }
    }
  },

  addNodeView() {
    return ({ editor, node }) => {
      const dom = document.createElement('div')

      dom.classList.add('colar-questao')

      const label = document.createElement('label')

      const close = document.createElement('button')
      close.innerHTML = '&times;'
      close.className = 'close-colar'

      close.addEventListener('click', () => {
        editor.commands.removeColarQuestao()
      })

      label.innerHTML = node.attrs.title
      label.contentEditable = 'false'

      const content = document.createElement('div')

      content.classList.add('content')
      content.classList.add('is-editable')

      dom.append(label, close, content)

      return {
        dom,
        contentDOM: content
      }
    }
  }
})

function isSelectionWithinNode(editor: Editor, nodeType: string): false | [PmNode, number] {
  const { state } = editor
  const { selection } = state
  const { $from, $to } = selection

  // Check if the selection is within a single node of the specified type
  let isWithinNode: false | [PmNode, number] = false

  state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
    if (node.type.name === nodeType) {
      isWithinNode = [node, pos]
      return false // Stop the traversal once we find the node
    }
    return true
  })

  return isWithinNode
}
