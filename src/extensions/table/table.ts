// @ts-nocheck
import { type Editor } from '@tiptap/core'
import Table from '@tiptap/extension-table'

import arrowDropDown from '../../assets/icons/Editor/arrow-drop-down-line.svg'
import { type EventProps } from '../../editor/ui'
import type ExitusEditor from '../../ExitusEditor'

import table from './../../assets/icons/Editor/table-2.svg'
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

function createDropDown(editor: ExitusEditor) {
  const dropdown = document.createElement('div')
  dropdown.className = 'ex-dropdown'
  dropdown.setAttribute('id', 'ex-dropdown' + editor.editorInstance)

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

  dropdown.appendChild(dropdownContent)
  document.body.appendChild(dropdown)

  window.addEventListener('click', function (event) {
    const target = event.target as HTMLElement
    if (!target.matches('.dropdown')) {
      const dropdowns = document.getElementsByClassName('ex-dropdown')

      Array.from(dropdowns as HTMLCollectionOf<HTMLElement>).forEach(openDropdown => {
        if (openDropdown.style.display === 'block') {
          removeSelectionFromGridButtons(dropdown)
          openDropdown.style.display = 'none'
        }
      })
    }
  })

  return dropdown
}

function removeSelectionFromGridButtons(dropdown: HTMLElement) {
  const buttons = dropdown.querySelectorAll('.ex-grid-button')
  buttons.forEach(element => {
    element.classList.remove('ex-grid-button-hover')
  })
}

function showTableGridDropdown({ event, editor, button }: EventProps) {
  event.stopPropagation()
  const dropdown = document.getElementById('ex-dropdown' + editor.editorInstance) || createDropDown(editor)

  if (dropdown.style.display === 'block') {
    removeSelectionFromGridButtons(dropdown)
    dropdown.style.display = 'none'
  } else {
    dropdown.style.display = 'block'
    const buttonRect = button.getBoundingClientRect()
    dropdown.style.top = buttonRect.top + buttonRect.height + 'px'
    dropdown.style.left = buttonRect.left + 'px'
  }
}

export const TableCustom = Table.extend({
  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: table + arrowDropDown,
        events: {
          click: showTableGridDropdown
        }
      }
    }
  },
  addOptions() {
    return {
      ...this.parent?.(),
      View: TableView
    }
  }
})
