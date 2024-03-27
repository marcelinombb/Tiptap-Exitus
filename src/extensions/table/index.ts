// @ts-nocheck
import Table from '@tiptap/extension-table'

import arrowDropDown from '../../assets/icons/Editor/arrow-drop-down-line.svg'

import table from './../../assets/icons/Editor/table-2.svg'
import { TableView } from './TableView'

function onSelectTableRowColumn(event) {
  const onColumn = parseInt(event.target.getAttribute('data-column'))
  const onRow = parseInt(event.target.getAttribute('data-row'))
  const buttons = event.target.parentNode.querySelectorAll('button')

  buttons.forEach(element => {
    const column = parseInt(element.getAttribute('data-column'))
    const row = parseInt(element.getAttribute('data-row'))
    if (row <= onRow && column <= onColumn) {
      element.classList.add('ex-grid-button-hover')
    } else {
      element.classList.remove('ex-grid-button-hover')
    }
  })
}

function insertTableRowColumn(editor) {
  return event => {
    const columns = parseInt(event.target.getAttribute('data-column'))
    const rows = parseInt(event.target.getAttribute('data-row'))
    editor.commands.insertTable({ rows: rows, cols: columns, withHeaderRow: true })
  }
}

function createDropDown(editor) {
  const dropdown = document.createElement('div')
  dropdown.className = 'ex-dropdown'
  dropdown.setAttribute('id', 'ex-dropdown')

  const dropdownContent = document.createElement('div')
  dropdownContent.className = 'ex-dropdown-content'
  dropdownContent.setAttribute('id', 'ex-dropdown-content')

  for (let row = 1; row <= 10; row++) {
    for (let column = 1; column <= 10; column++) {
      const button = document.createElement('button')
      button.classList.add('ex-grid-button')
      button.setAttribute('data-row', row)
      button.setAttribute('data-column', column)
      button.addEventListener('pointerover', onSelectTableRowColumn)
      button.addEventListener('click', insertTableRowColumn(editor))
      dropdownContent.appendChild(button)
    }
  }

  dropdown.appendChild(dropdownContent)
  document.body.appendChild(dropdown)

  return dropdown
}

function removeSelectionFromGridButtons(dropdown) {
  const buttons = dropdown.querySelectorAll('.ex-grid-button')
  buttons.forEach(element => {
    element.classList.remove('ex-grid-button-hover')
  })
}

function showTableGridDropdown({ event, editor, button }) {
  event.stopPropagation()
  console.log(button)
  const dropdown = document.getElementById('ex-dropdown') || createDropDown(editor)

  if (button.classList.contains('ex-toolbar-button-active')) {
    button.classList.remove('ex-toolbar-button-active')
    removeSelectionFromGridButtons(dropdown)
    dropdown.style.display = 'none'
  } else {
    button.classList.add('ex-toolbar-button-active')

    dropdown.style.display = 'block'
    const buttonRect = button.getBoundingClientRect()
    dropdown.style.top = buttonRect.top + buttonRect.height + 'px'
    dropdown.style.left = buttonRect.left + 'px'

    window.onclick = function (event) {
      if (!event.target.matches('.dropdown')) {
        const dropdowns = document.getElementsByClassName('ex-dropdown')

        Array.from(dropdowns).forEach(openDropdown => {
          if (openDropdown.style.display === 'block') {
            button.classList.remove('ex-toolbar-button-active')
            removeSelectionFromGridButtons(dropdown)
            openDropdown.style.display = 'none'
          }
        })
      }
    }
  }
}

const TableCustom = Table.extend({
  addStorage() {
    return {
      toolbarButton: {
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

export default TableCustom
