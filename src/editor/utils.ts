import { type Editor } from '@tiptap/core'
import { type Node } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'

export function createHTMLElement(tagName: string, attributes: { [x: string]: string }, childrens?: Element[]): Element {
  // Create the element
  const element = document.createElement(tagName)

  // Set attributes if provided
  if (attributes) {
    for (const key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        element.setAttribute(key, attributes[key])
      }
    }
  }

  // Set content if provided
  if (childrens) {
    element.append(...childrens)
  }

  return element
}

export function setCaretAfterNode(editor: Editor, targetNode: Node) {
  const { state, view } = editor
  const { doc, tr } = state

  // Find the position of the target node
  let targetPos = null
  doc.descendants((node, pos) => {
    if (node === targetNode) {
      targetPos = pos + node.nodeSize // Position after the target node
      return false // Stop the iteration
    }
    return true
  })

  if (targetPos !== null) {
    const selection = TextSelection.create(doc, targetPos)
    const transaction = tr.setSelection(selection)
    view.dispatch(transaction)
  } else {
    console.error('Node not found in the document')
  }
}

export function getNodeFromSelection(editor: Editor): Node | null {
  const { state } = editor
  const { from } = state.selection
  const node = state.doc.nodeAt(from)
  return node
}
