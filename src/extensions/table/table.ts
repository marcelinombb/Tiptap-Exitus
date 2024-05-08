//@ts-nocheck
import { mergeAttributes } from '@tiptap/core'
import arrowDropDown from '@icons/arrow-drop-down-line.svg'
import table from '@icons/table-2.svg'
import { createColGroup, Table } from '@tiptap/extension-table'
import { selectedRect } from '@tiptap/pm/tables'
import { findParentNodeOfType, findSelectedNodeOfType } from 'prosemirror-utils'
import { Dropdown } from '../../editor/ui'
import type ExitusEditor from '../../ExitusEditor'

import { TableView } from './TableView'

function onSelectTableRowColumn(event): EventListener {
  const onColumn = parseInt(event.target.getAttribute('data-column'))
  const onRow = parseInt(event.target.getAttribute('data-row'))
  const buttons = event.target.parentNode.querySelectorAll('button') as HTMLCollectionOf<HTMLButtonElement>

  Array.from(buttons).forEach(element => {
    const column = parseInt(element.getAttribute('data-column') as string)
    const row = parseInt(element.getAttribute('data-row') as string)
    if (row <= onRow && column <= onColumn) {
      element.classList.add('ex-grid-button-hover')
    } else {
      element.classList.remove('ex-grid-button-hover')
    }
  })
}

function insertTableRowColumn(editor: ExitusEditor): EventListener {
  return event => {
    const target = event.target as HTMLElement
    const columns = parseInt(target.getAttribute('data-column') as string)
    const rows = parseInt(target.getAttribute('data-row') as string)
    editor.commands.insertTable({ rows: rows, cols: columns, withHeaderRow: true })
  }
}

function createDropDownContent(editor: ExitusEditor) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = 'ex-dropdown-content ex-dropdown-table-cells'
  dropdownContent.setAttribute('id', 'ex-dropdown-content')

  for (let row = 1; row <= 10; row++) {
    for (let column = 1; column <= 10; column++) {
      const button = document.createElement('button')
      button.classList.add('ex-grid-button')
      button.setAttribute('data-row', `${row}`)
      button.setAttribute('data-column', `${column}`)
      button.addEventListener('pointerover', onSelectTableRowColumn)
      button.addEventListener('click', insertTableRowColumn(editor))
      dropdownContent.appendChild(button)
    }
  }

  return dropdownContent
}

function removeSelectionFromGridButtons(dropdown: Dropdown) {
  const buttons = dropdown.dropdownContent.querySelectorAll('.ex-grid-button')
  buttons.forEach(element => {
    element.classList.remove('ex-grid-button-hover')
  })
}

function showTableGridDropdown({ dropdown }) {
  if (dropdown.isOpen) {
    removeSelectionFromGridButtons(dropdown)
    dropdown.off()
  } else {
    dropdown.on()
  }
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setTableBorder: () => ReturnType
  }
}

function tableDropDown({ editor }: { editor: any }) {
  const dropdown = new Dropdown(editor, {
    events: {
      open: showTableGridDropdown
    }
  })

  dropdown.setDropDownContent(createDropDownContent(editor))

  window.addEventListener('click', function (event) {
    const target = event.target as HTMLElement
    if (!target.matches('.dropdown')) {
      dropdown.off()
    }
  })

  return dropdown
}

export const TableCustom = Table.extend({
  addStorage() {
    return {
      toolbarButtonConfig: [
        {
          icon: table + arrowDropDown,
          dropdown: tableDropDown
        }
      ]
    }
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      ballonActive: {
        default: false
      },
      style: {
        default: '',
        parseHTML: element => {
          //if ((element!.parentNode as HTMLElement).tagName.toUpperCase() !== 'FIGURE') return null
          console.log(element.getAttribute('style'))

          return (element as HTMLElement).getAttribute('style')
        }
      }
    }
  },
  renderHTML({ node, HTMLAttributes }) {
    const { colgroup } = createColGroup(node, this.options.cellMinWidth)

    const borderStyle = node.attrs.style || 'none'

    const table: DOMOutputSpec = [
      'table',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        /* style: `border: ${borderStyle}` */
      }),
      colgroup,
      ['tbody', 0]
    ]

    return table
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setTableBorder: border => {
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

          // Ensure we have a valid border value
          if (!border || typeof border !== 'string') return false

          // Create a new attributes object with the updated border
          const attrs = {
            ...tableNode.node.attrs,
            style: `border: ${border} !important`
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
  addOptions() {
    return {
      ...this.parent?.()
    }
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      return new TableView(node, editor, getPos)
    }
  }
})
