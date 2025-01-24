import { Plugin } from '@editor/Plugin'
import { Button, type ButtonEventProps, type Dropdown, type DropDownEventProps } from '@editor/ui'
import TableCell from '@extensions/table-cell/src'
import table from '@icons/table-2.svg'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

import { TableCustom } from './table'
import './styles.css'

export class TablePlugin extends Plugin {
  static get pluginName() {
    return 'table'
  }

  static get requires() {
    return [
      TableCustom.configure({
        resizable: true,
        allowTableNodeSelection: true,
        cellMinWidth: 30
      }),
      TableRow,
      TableHeader,
      TableCell.configure({
        cellMinWidth: 30
      })
    ]
  }

  init(): void {
    this.editor.toolbar.setDropDown(
      TablePlugin.pluginName,
      {
        icon: table,
        click: showTableGridDropdown,
        tooltip: 'Inserir tabela',
        classes: []
      },
      dropdown => {
        return this.createDropDownContent(dropdown)
      }
    )
  }

  createDropDownContent(dropdown: Dropdown) {
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
        const button = new Button(this.editor, {
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
}

function showTableGridDropdown({ dropdown }: DropDownEventProps) {
  if (dropdown.isOpen) {
    removeSelectionFromGridButtons(dropdown)
    dropdown.off()
  } else {
    dropdown.on()
  }
}

function onSelectTableRowColumn(event: Event, indicator: Element) {
  const element = event.target as HTMLElement
  const onColumn = parseInt(element.getAttribute('data-column') as string)
  const onRow = parseInt(element.getAttribute('data-row') as string)
  if (indicator) {
    indicator.textContent = `${onRow} × ${onColumn}`
  }

  const buttons = element.parentNode?.querySelectorAll('button')

  for (const button of buttons ?? []) {
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

function removeSelectionFromGridButtons(dropdown: Dropdown) {
  const buttons = dropdown.dropdownContent.querySelectorAll('.ex-grid-button')
  buttons.forEach(element => {
    element.classList.remove('ex-grid-button-hover')
  })
}
