// @ts-nocheck
import arrowDropDown from '@icons/arrow-drop-down-line.svg'
import table from '@icons/table-2.svg'
import Table from '@tiptap/extension-table'

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

function tableDropDown({ editor }) {
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
      }
    }
  },
  addOptions() {
    return {
      ...this.parent?.()
    }
  },
  addNodeView() {
    return ({ node, editor }) => {
      return new TableView(node, editor)
    }
  }
})
