import closeIcon from '@icons/close-line.svg'
import { Editor, mergeAttributes, Node } from '@tiptap/core'
import { Fragment, type Node as PmNode, type Schema, Slice } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'

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
        return ({ tr, state, dispatch, editor }) => {
          const { schema } = state

          if (existsOnDoc(state, title, this.name)) return false

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

            const { from, to } = expandSelectionToBlock(state)

            const slice = state.doc.slice(from, to)

            const content = ensureBlockContent(slice, schema)

            const node = schema.nodes.colarQuestao.create(
              { title },
              content
            )

            tr.replaceRangeWith(from, to, node)

            return true
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

function existsOnDoc(state: EditorState, title: string, nodeName: string): boolean {

  let existsOnDoc = false

  state.doc.descendants(node => {
    if (node.type.name === nodeName && node.attrs.title === title) {
      existsOnDoc = true
      return false
    }
    return true
  })

  return existsOnDoc

}

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

function expandSelectionToBlock(state: EditorState): { from: number, to: number } {
  const { $from, $to, from, to } = state.selection

  if ($from.depth === 0 || $to.depth === 0) {
    
    return {
      from: from,
      to: to,
    }
  }

  const fromBlockPos = $from.before($from.depth)
  const toBlockPos = $to.after($to.depth)

  return {
    from: fromBlockPos,
    to: toBlockPos,
  }
}


function ensureBlockContent(slice: Slice, schema: Schema): Fragment {
  const items: PmNode[] = []
  let inline: PmNode[] = []

  slice.content.forEach(node => {
    if (node.isInline) {
      inline.push(node)
    } else if (node.isBlock) {
      if (inline.length) {
        items.push(schema.nodes.paragraph.create(null, inline))
        inline = []
      }
      items.push(node)
    }
  })

  if (inline.length) {
    items.push(schema.nodes.paragraph.create(null, inline))
  }

  if (!items.length) {
    return Fragment.fromArray([schema.nodes.paragraph.create()])
  }

  return Fragment.fromArray(items)
}
