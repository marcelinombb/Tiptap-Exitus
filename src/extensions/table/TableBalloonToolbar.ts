import { Toolbar } from '@editor/toolbar/Toolbar'
import { Balloon, BalloonPosition, type DropDownEventProps } from '@editor/ui'
import { getNodeBoundingClientRect } from '@editor/utils'
import starredCell from '@icons/table-cell-properties.svg'
import tableColumns from '@icons/table-column.svg'
import tableCell from '@icons/table-merge-cell.svg'
import starredTable from '@icons/table-properties.svg'
import tableRow from '@icons/table-row.svg'
import type ExitusEditor from '@src/ExitusEditor'
import { type Editor } from '@tiptap/core'

import { ItensModalTable } from './itensModalTable'
import { TableCellBalloon } from './TableCellBalloon'
import { dropDownCell, dropDownColunas, dropDownLinhas } from './tableToolbarItens'

function showDropdown({ event, dropdown }: DropDownEventProps) {
  event.stopPropagation()
  if (dropdown.isOpen) {
    dropdown.off()
  } else {
    dropdown.on()
  }
}

function clickCellHandler(tableCellBalloon: TableCellBalloon) {
  function clickOutside(event: Event) {
    const target = event.target as HTMLElement

    if (target.closest('.pcr-app') !== null) {
      return
    }

    if (target.closest('.balloon-menu') == null) {
      tableCellBalloon.off()
      window.removeEventListener('click', clickOutside)
    }
  }

  window.addEventListener('click', clickOutside)
}

export class TableBalloonToolbar {
  balloon: Balloon
  tableCellBalloon: TableCellBalloon
  itensModalTable: ItensModalTable
  editor: Editor
  public static instance = new WeakMap<Editor, TableBalloonToolbar>()

  constructor(editor: Editor) {
    this.editor = editor
    const toolbar = new Toolbar(editor as ExitusEditor, ['colTable', 'rowTable', 'cellTable', 'tableProperties', 'cellProperties'])
    this.tableCellBalloon = TableCellBalloon.getInstance(editor as ExitusEditor)
    this.itensModalTable = ItensModalTable.getIntance(this.editor as ExitusEditor)

    toolbar.setDropDown(
      'colTable',
      {
        icon: tableColumns,
        tooltip: 'Coluna',
        click: showDropdown,
        classes: ['ex-dropdown-balloonTable']
      },
      dropdown => {
        return dropDownColunas(this.editor as ExitusEditor, dropdown)
      }
    )
    toolbar.setDropDown(
      'rowTable',
      {
        icon: tableRow,
        tooltip: 'Linha',
        click: showDropdown,
        classes: ['ex-dropdown-balloonTable']
      },
      dropdown => {
        return dropDownLinhas(this.editor as ExitusEditor, dropdown)
      }
    )
    toolbar.setDropDown(
      'cellTable',
      {
        icon: tableCell,
        tooltip: 'Mesclar células',
        click: showDropdown,
        classes: ['ex-dropdown-balloonTable']
      },
      dropdown => {
        return dropDownCell(this.editor as ExitusEditor, dropdown)
      }
    )
    toolbar.setDropDown(
      'tableProperties',
      {
        icon: starredTable,
        click: showDropdown,
        tooltip: 'Propriedades da tabela',
        classes: ['ex-dropdown-balloonModal'],
        closeDropDown: (elem: HTMLElement) => {
          return !elem.closest('.pcr-app')
        }
      },
      _dropdown => {
        return this.itensModalTable.render()
      }
    )
    toolbar.setButton('cellProperties', {
      icon: starredCell,
      click: () => {
        this.tableCellBalloon.updatePosition()
        this.balloon.hide()
        clickCellHandler(this.tableCellBalloon)
      },
      tooltip: 'Propriedades da célula'
    })

    this.balloon = new Balloon(editor, {
      position: BalloonPosition.FLOAT,
      arrowPosition: 'bottom'
    })

    this.balloon.ballonPanel.appendChild(toolbar.render())

    editor.view.dom!.parentElement!.appendChild(this.balloon.getBalloon())
  }

  updatePosition(pos: number) {
    try {
      const { top, left, width } = getNodeBoundingClientRect(this.editor, pos)
      const main = this.editor.view.dom.getBoundingClientRect()
      this.balloon.setPosition(left - main.left + width / 2, top - main.y, 'top')
    } catch (error) {
      console.error(error)
    }
  }

  public static getInstance(editor: Editor, styles: any) {
    if (!TableBalloonToolbar.instance.has(editor)) {
      TableBalloonToolbar.instance.set(editor, new TableBalloonToolbar(editor))
    }

    TableBalloonToolbar.instance.get(editor)?.itensModalTable.updateStyles(styles)

    return TableBalloonToolbar.instance.get(editor) as TableBalloonToolbar
  }
}
