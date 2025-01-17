import closeIcon from '@icons/close-line.svg'
import { type Editor, mergeAttributes, Node } from '@tiptap/core'
import { Fragment, type Node as PmNode, type Schema, Slice } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    colarQuestao: {
      addColarQuestao: (title: string) => ReturnType
      removeColarQuestao: (pos: number) => ReturnType
    }
  }
}

export const ColarQuestao = Node.create({
  name: 'colarQuestao',

  group: 'block',

  content: 'block*',

  selectable: false,

  isolating: true,

  defining: true,

  draggable: true,

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
        return ({ editor, tr, dispatch, state, view }) => {
          let existsOnDoc = false

          state.doc.descendants(node => {
            if (node.type.name === this.name && node.attrs.title === title) {
              existsOnDoc = true
              return false // Stop the iteration
            }
            return true
          })

          if (existsOnDoc) return false

          const selectedNode = isSelectionWithinNode(editor, this.name)

          if (selectedNode) {
            const [node, pos] = selectedNode

            if (node.attrs.title === title) return false

            if (dispatch) {
              tr.setNodeMarkup(pos, undefined, { title })
              dispatch(tr)
            }
            return true
          } else {
            const { from, to } = state.selection
            const slice = state.doc.slice(from, to)

            const newSlice = ensureBlockContent(slice, state.schema)

            const colarNode = state.schema.nodes.colarQuestao.createChecked({ title }, newSlice.content)

            let transaction = tr.replaceRangeWith(from, to, colarNode)

            const newSelection = TextSelection.create(transaction.doc, from + 1)
            transaction = transaction.setSelection(newSelection)

            if (dispatch) {
              dispatch(transaction)
              view.focus()
              return true
            }

            return false
          }
        }
      },
      removeColarQuestao: (pos: number) => {
        return ({ dispatch, tr, state }) => {
          if (dispatch) {
            const node = state.doc.nodeAt(pos)
            const content = node!.content
            tr.replaceWith(pos, pos + node!.nodeSize, content)
            dispatch(tr)
            return true
          }

          return false
        }
      }
    }
  },

  addNodeView() {
    return ({ editor, node, getPos }) => {
      const dom = document.createElement('div')
      dom.draggable = true
      dom.classList.add('colar-questao')

      // Prevent any drop actions within this node view
      dom.addEventListener('drop', event => {
        const draggedNodeType = event.dataTransfer?.getData('text/html') ?? ''
        if (/colar-questao/i.test(draggedNodeType)) {
          event.preventDefault()
        }
      })

      const label = document.createElement('label')
      label.contentEditable = 'false'

      const close = document.createElement('button')
      close.contentEditable = 'false'
      close.innerHTML = closeIcon
      close.className = 'close-colar'

      close.addEventListener('click', () => {
        if (typeof getPos === 'function') {
          editor.commands.removeColarQuestao(getPos())
        }
      })

      label.innerHTML = node.attrs.title

      const content = document.createElement('div')
      content.classList.add('colar-content')
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

function ensureBlockContent(slice: Slice, schema: Schema) {
  const blockNodes: PmNode[] = []
  let inlineNodes: PmNode[] = []

  slice.content.forEach(node => {
    if (node.isBlock) {
      if (inlineNodes.length) {
        const paragraph = schema.nodes.paragraph.create(null, inlineNodes)
        inlineNodes = []
        blockNodes.push(paragraph)
      }
      blockNodes.push(node)
    } else if (node.isInline) {
      inlineNodes.push(node)
    }
  })

  if (inlineNodes.length) {
    const paragraph = schema.nodes.paragraph.create(null, inlineNodes)
    inlineNodes = []
    blockNodes.push(paragraph)
  }

  let fragment = Fragment.fromArray(blockNodes)

  if (fragment.size === 0) {
    fragment = Fragment.fromArray([schema.nodes.paragraph.create(null, null)])
  }

  return new Slice(fragment, slice.openStart, slice.openEnd)
}
