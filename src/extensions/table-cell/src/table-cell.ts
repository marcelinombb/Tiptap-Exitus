import { cssParaObj, objParaCss } from '@editor/utils'
import { mergeAttributes, Node } from '@tiptap/core'
import { type DOMOutputSpec, type ResolvedPos } from '@tiptap/pm/model'

export interface TableCellOptions {
  /**
   * The HTML attributes for a table cell node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
  cellMinWidth: number
}

/**
 * This extension allows you to create table cells.
 * @see https://www.tiptap.dev/api/nodes/table-cell
 */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableCell: {
      setCellAttributes: (resPos: ResolvedPos, attributes: { [key: string]: any }) => ReturnType
    }
  }
}

export const TableCell = Node.create<TableCellOptions>({
  name: 'tableCell',

  addOptions() {
    return {
      HTMLAttributes: {},
      cellMinWidth: 30
    }
  },

  content: 'block+',

  addAttributes() {
    return {
      colspan: {
        default: 1
      },
      rowspan: {
        default: 1
      },
      style: {
        default: {},
        parseHTML: element => {
          const style = element.getAttribute('style')
          return style ? cssParaObj(style) : {}
        }
      },
      colwidth: {
        default: null,
        parseHTML: element => {
          const colwidth = element.getAttribute('colwidth')
          return colwidth ? [parseInt(colwidth, 10)] : null
        }
      }
    }
  },

  tableRole: 'cell',

  isolating: true,

  parseHTML() {
    return [{ tag: 'td' }]
  },

  renderHTML({ HTMLAttributes }) {
    const attributesMerged = mergeAttributes(this.options.HTMLAttributes, {
      ...HTMLAttributes,
      colwidth: HTMLAttributes.colwidth ?? [''],
      style: objParaCss(HTMLAttributes.style)
    })

    const celula: DOMOutputSpec = ['td', attributesMerged, 0]

    return celula
  },
  addCommands() {
    return {
      setCellAttributes:
        (resPos: ResolvedPos, attributes: { [key: string]: any }) =>
        ({ dispatch, tr }) => {
          const { nodeAfter, pos } = resPos

          const attrs = {
            ...nodeAfter?.attrs,
            style: {
              ...nodeAfter?.attrs.style,
              ...attributes
            }
          }
          if (dispatch) {
            tr.setNodeMarkup(pos, undefined, attrs)
            dispatch(tr)
            return true
          }

          return false
        }
    }
  }
})
