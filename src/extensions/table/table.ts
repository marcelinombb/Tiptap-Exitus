import { cssParaObj, objParaCss } from '@editor/utils'
import { mergeAttributes } from '@tiptap/core'
import { type DOMOutputSpec } from '@tiptap/pm/model'
import { findParentNodeOfType } from 'prosemirror-utils'

import { createColGroup, Table } from './extension-table/src'
import { TableView } from './TableView'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableCustom: {
      setTableBorder: (styles: Record<string, any>) => ReturnType
      setWrapperStyle: (styles: Record<string, any>) => ReturnType
      setTableStyle: (styles: Record<string, any>) => ReturnType
    }
  }
}

export const TableCustom = Table.extend({
  draggable: true,
  addAttributes() {
    return {
      ...this.parent?.(),
      ballonActive: {
        default: false
      },
      style: {
        default: {},
        parseHTML: element => {
          const style = element.getAttribute('style')

          return style && cssParaObj(style)
        }
      },
      styleTableWrapper: {
        default: {},
        parseHTML: element => {
          const styleTableWrapper = element?.parentElement?.getAttribute('style')

          return styleTableWrapper && cssParaObj(styleTableWrapper)
        }
      }
    }
  },
  renderHTML({ node, HTMLAttributes }) {
    const { colgroup, tableWidth, tableMinWidth } = createColGroup(node, this.options.cellMinWidth)

    const style = HTMLAttributes.style || {}
    const styleTableWrapper = HTMLAttributes.styleTableWrapper || {}

    const mergedAttributes = mergeAttributes(this.options.HTMLAttributes, {
      class: tableWidth ? 'table-resized' : '',
      style: objParaCss(style)
    })

    const table: DOMOutputSpec = [
      'div',
      [
        'div',
        { class: 'tableWrapper tiptap-widget', style: objParaCss({ ...styleTableWrapper, width: tableWidth || tableMinWidth }) },
        ['table', mergedAttributes, colgroup, ['tbody', 0]]
      ]
    ]
    return table
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setTableStyle: style => {
        return ({ tr, state, dispatch }) => {
          // Get the selection
          const { selection } = state
          // Find the table node around the selection
          let nodePos = null
          const tableNode = findParentNodeOfType(state.schema.nodes.table)(selection)

          if (tableNode) {
            nodePos = tableNode.pos
          }
          // If no table was found or position is undefined, abort the command
          if (nodePos == null) return false

          // Create a new attributes object with the updated style
          const attrs = {
            ...tableNode!.node.attrs,
            style: {
              ...tableNode!.node.attrs.style,
              ...style
            }
          }
          // Create a transaction that sets the new attributes
          if (dispatch) {
            tr.setNodeMarkup(nodePos, undefined, attrs)
            dispatch(tr)
          }
          return true
        }
      },
      setWrapperStyle: styleTableWrapper => {
        return ({ tr, state, dispatch }) => {
          // Get the selection
          const { selection } = state

          // Find the tableWrapper node around the selection
          const tableWrapperNode = findParentNodeOfType(state.schema.nodes.table)(selection)

          // If no tableWrapper was found, abort the command
          if (!tableWrapperNode) return false

          // Get the position of the tableWrapper node
          const nodePos = tableWrapperNode.pos

          // Create a new attributes object with the updated style
          const attrs = {
            ...tableWrapperNode.node.attrs,
            styleTableWrapper: {
              ...tableWrapperNode.node.attrs.styleTableWrapper,
              ...styleTableWrapper
            }
          }
          // Create a transaction that sets the new attributes
          if (dispatch) {
            tr.setNodeMarkup(nodePos, undefined, attrs)
            dispatch(tr)
          }

          return true
        }
      }
    }
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      return new TableView(node, editor, getPos)
    }
  }
})
