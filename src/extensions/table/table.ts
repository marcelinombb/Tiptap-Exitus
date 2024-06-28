//@ts-nocheck
import { Button, type ButtonEventProps, Dropdown } from '@editor/ui'
import { Button, type ButtonEventProps, Dropdown } from '@editor/ui'
import arrowDropDown from '@icons/arrow-drop-down-line.svg'
import table from '@icons/table-2.svg'
import { mergeAttributes } from '@tiptap/core'
import { findParentNodeOfType } from 'prosemirror-utils'

import type ExitusEditor from '../../ExitusEditor'

import { createColGroup, Table } from './extension-table/src'
import { TableView } from './TableView'

function onSelectTableRowColumn(event, indicator) {
  const element = event.target as HTMLElement
  const onColumn = parseInt(element.getAttribute('data-column'))
  const onRow = parseInt(element.getAttribute('data-row'))
  if (indicator) {
    indicator.textContent = `${onRow} × ${onColumn}`
  }

  const buttons = element.parentNode.querySelectorAll('button') as HTMLCollectionOf<HTMLButtonElement>

  for (const button of buttons) {
    const column = parseInt(button.getAttribute('data-column') as string)
    const row = parseInt(button.getAttribute('data-row') as string)
    if (row <= onRow && column <= onColumn) {
      button.classList.add('ex-grid-button-hover')
    } else {
      button.classList.remove('ex-grid-button-hover')
    }
  }
}

function insertTableRowColumn({ editor, event }: ButtonEventProps) {
  const target = event.target as HTMLElement
  const columns = parseInt(target.getAttribute('data-column') as string)
  const rows = parseInt(target.getAttribute('data-row') as string)
  editor.chain().insertTable({ rows: rows, cols: columns, withHeaderRow: false }).focus().run()
}

function createDropDownContent(editor: ExitusEditor, dropdown: Dropdown) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = 'ex-dropdown-content'
  dropdownContent.setAttribute('id', 'ex-dropdown-content')

  const indicator = document.createElement('div')
  indicator.className = 'ex-indicator'
  dropdownContent.appendChild(indicator)

  const div = document.createElement('div')
  div.className = 'ex-dropdown-table-cells'

  for (let row = 1; row <= 10; row++) {
    for (let column = 1; column <= 10; column++) {
      const button = new Button(editor, {
        classList: ['ex-grid-button'],
        attributes: {
          'data-row': `${row}`,
          'data-column': `${column}`
        }
      })

      button.bind('pointerover', ({ event }) => {
        onSelectTableRowColumn(event, indicator)
      })
      button.bind('click', (btnEvents: ButtonEventProps) => {
        insertTableRowColumn(btnEvents)
        removeSelectionFromGridButtons(dropdown)
        dropdown.off()
      })
      div.appendChild(button.render())
    }
  }
  dropdownContent.append(div, indicator)

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

function tableDropDown({ editor }: ButtonEventProps) {
  const dropdown = new Dropdown(editor, {
    events: {
      open: showTableGridDropdown
    }
  })

  dropdown.setDropDownContent(createDropDownContent(editor, dropdown))

  window.addEventListener('click', function (event: Event) {
    event.stopPropagation()
    if (dropdown.isOpen) {
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

export function updateColumns(
  node: ProseMirrorNode,
  colgroup: Element,
  table: Element,
  cellMinWidth: number,
  overrideCol?: number,
  overrideValue?: any
) {
  let totalWidth = 0
  let fixedWidth = true
  let nextDOM = colgroup.firstChild
  const row = node.firstChild

  for (let i = 0, col = 0; i < row.childCount; i += 1) {
    const { colspan, colwidth } = row.child(i).attrs

    for (let j = 0; j < colspan; j += 1, col += 1) {
      const hasWidth = overrideCol === col ? overrideValue : colwidth && colwidth[j]
      const cssWidth = hasWidth ? `${hasWidth}px` : ''

      totalWidth += hasWidth || cellMinWidth

      if (!hasWidth) {
        fixedWidth = false
      }

      if (!nextDOM) {
        colgroup.appendChild(document.createElement('col')).style.width = cssWidth
      } else {
        if (nextDOM.style.width !== cssWidth) {
          nextDOM.style.width = cssWidth
        }

        nextDOM = nextDOM.nextSibling
      }
    }
  }

  while (nextDOM) {
    const after = nextDOM.nextSibling

    nextDOM.parentNode.removeChild(nextDOM)
    nextDOM = after
  }

  if (fixedWidth) {
    table.style.width = `${totalWidth}px`
    table.style.minWidth = ''
  } else {
    table.style.width = ''
    table.style.minWidth = `${totalWidth}px`
    console.log('eoq man')
  }
}

export class TableView2 {
  node: ProseMirrorNode

  cellMinWidth: number

  dom: Element

  table: Element

  colgroup: Element

  contentDOM: Element

  constructor(node: ProseMirrorNode, cellMinWidth: number, editor) {
    console.log(editor)

    this.node = node
    this.cellMinWidth = cellMinWidth
    this.dom = document.createElement('div')
    this.dom.className = 'tableWrapper'
    this.table = this.dom.appendChild(document.createElement('table'))
    this.colgroup = this.table.appendChild(document.createElement('colgroup'))
    //updateColumns(node, this.colgroup, this.table, cellMinWidth)
    this.contentDOM = this.table.appendChild(document.createElement('tbody'))
  }
}

export const TableCustom = Table.extend({
  addStorage() {
    return {
      toolbarButtonConfig: [
        {
          icon: table + arrowDropDown,
          dropdown: tableDropDown,
          tooltip: 'Inserir tabela'
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
          const styleTableWrapper = element.parentElement.getAttribute('style')

          return styleTableWrapper && cssParaObj(styleTableWrapper)
        }
      }
    }
  },
  renderHTML({ node, HTMLAttributes }) {
    const { colgroup, tableWidth } = createColGroup(node, this.options.cellMinWidth)

    const style = HTMLAttributes.style || {}
    const styleTableWrapper = HTMLAttributes.styleTableWrapper || {}

    const mergedAttributes = mergeAttributes(this.options.HTMLAttributes, {
      style: objParaCss({ width: tableWidth, ...style })
    })

    const table: DOMOutputSpec = [
      'div',
      ['div', { class: 'tableWrapper tiptap-widget', style: objParaCss(styleTableWrapper) }, ['table', mergedAttributes, colgroup, ['tbody', 0]]]
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
      }
    }
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      return new TableView(node, editor, getPos)
    }
  }
})
