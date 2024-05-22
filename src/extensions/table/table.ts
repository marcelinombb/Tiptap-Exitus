//@ts-nocheck
import arrowDropDown from '@icons/arrow-drop-down-line.svg'
import table from '@icons/table-2.svg'
import { mergeAttributes } from '@tiptap/core'
import { createColGroup, Table } from '@tiptap/extension-table'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { selectedRect } from '@tiptap/pm/tables'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { setCellAttr } from '@tiptap/pm/tables'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { findParentNodeOfType, findSelectedNodeOfType } from 'prosemirror-utils'

import { Dropdown } from '../../editor/ui'
import type ExitusEditor from '../../ExitusEditor'

import { TableView } from './TableView'

function onSelectTableRowColumn(event): EventListener {
  const onColumn = parseInt(event.target.getAttribute('data-column'))
  const onRow = parseInt(event.target.getAttribute('data-row'))
  const indicator = document.querySelector('.ex-indicator')
  if (indicator) {
    indicator.textContent = `${onRow} × ${onColumn}`
  }

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

  const indicator = document.createElement('div')
  indicator.className = 'ex-indicator'
  dropdownContent.appendChild(indicator)

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

export function cssParaObj(cssString: string): { [key: string]: string } {
  const styles: { [key: string]: string } = {}

  // Remover espaços em branco desnecessários
  cssString = cssString.replace(/\s*:\s*/g, ':').replace(/\s*;\s*/g, ';')

  // Dividir a string por ponto e vírgula para obter as declarações individuais
  const declarations = cssString.split(';')

  // Iterar sobre as declarações e adicionar ao objeto
  declarations.forEach(declaration => {
    const [property, value] = declaration.split(':')
    if (property && value) {
      styles[property.trim()] = value.trim()
    }
  })

  return styles
}

export function objParaCss(styles: { [key: string]: string }): string {
  let cssString = ''

  for (const property in styles) {
    if (styles.hasOwnProperty(property)) {
      cssString += `${property}: ${styles[property]}; `
    }
  }

  return cssString.trim()
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
        default: {},
        parseHTML: element => {
          const style = element.getAttribute('style')

          return style && cssParaObj(style)
        }
      },
      styleTableWrapper: {
        default: {},
        parseHTML: element => {
          const styleTableWrapper = element.getAttribute('styleTableWrapper')

          return styleTableWrapper && cssParaObj(styleTableWrapper)
        }
      }
    }
  },
  renderHTML({ node, HTMLAttributes }) {
    const { colgroup } = createColGroup(node, this.options.cellMinWidth)

    const style = HTMLAttributes.style || {}
    const styleTableWrapper = HTMLAttributes.styleTableWrapper || {}

    const mergedAttributes = mergeAttributes(this.options.HTMLAttributes, {
      ...HTMLAttributes,
      style: objParaCss(style),
      styleTableWrapper: objParaCss(styleTableWrapper)
    })

    const table: DOMOutputSpec = ['table', mergedAttributes, colgroup, ['tbody', 0]]

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
            ...tableNode.node.attrs,
            style: {
              ...tableNode.node.attrs.style,
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
      } /* ,
      setCellAttribute:
        (attributes: { [key: string]: any }) =>
        ({ state, dispatch }) => {
          Object.entries(attributes).forEach(([name, value]) => {
            setCellAttr(name, value)(state, dispatch)
          })
          return true
        } */
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
