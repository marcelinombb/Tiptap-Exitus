import { Toolbar } from '@editor/toolbar'
import { type DropDownEventProps } from '@editor/ui'
import { Balloon, BalloonPosition } from '@editor/ui/Balloon'
import { objParaCss } from '@editor/utils'
import starredCell from '@icons/table-cell-properties.svg'
import tableColumns from '@icons/table-column.svg'
import tableCell from '@icons/table-merge-cell.svg'
import starredTable from '@icons/table-properties.svg'
import tableRow from '@icons/table-row.svg'
import type ExitusEditor from '@src/ExitusEditor'
import { type Editor } from '@tiptap/core'
import { type Node as ProseMirrorNode } from '@tiptap/pm/model'
import { type NodeView, type ViewMutationRecord } from '@tiptap/pm/view'

import { ItensModalTable } from './itensModalTable'
import { updateColumnsOnResize } from './prosemirror-tables/src'
import { TableCellBalloon } from './TableCellBalloon'
import TableFocus, { UpDownTable } from './tableFocus'
import { dropDownCell, dropDownColunas, dropDownLinhas } from './tableToolbarItens'

function clickHandler(tableView: TableView) {
  tableView.table.addEventListener('click', () => {
    if (!tableView.balloon.isOpen()) {
      tableView.balloon.show()
    }

    function clickOutside(event: Event) {
      const target = event.target as HTMLElement

      if (target.closest('.pcr-app') !== null) {
        return
      }

      if (target.closest('.tableWrapper') == null) {
        tableView.balloon.hide()
        tableView.tableWrapper.classList.remove('ex-selected')
        window.removeEventListener('click', clickOutside)
      }
    }

    window.addEventListener('click', clickOutside)
  })
}

function clickCellHandler(tableView: TableView) {
  function clickOutside(event: Event) {
    const target = event.target as HTMLElement

    if (target.closest('.pcr-app') !== null) {
      return
    }

    if (target.closest('.balloon-menu') == null) {
      tableView.tableCellBalloon.off()
      window.removeEventListener('click', clickOutside)
    }
  }

  window.addEventListener('click', clickOutside)
}

function showDropdown({ event, dropdown }: DropDownEventProps) {
  event.stopPropagation()
  if (dropdown.isOpen) {
    dropdown.off()
  } else {
    dropdown.on()
  }
}
export class TableView implements NodeView {
  node: ProseMirrorNode
  dom: Element
  table: HTMLTableElement
  colgroup: HTMLTableColElement
  balloon: Balloon
  tableCellBalloon: TableCellBalloon
  editor: Editor
  cellMinWidth: number
  tableWrapper: HTMLElement
  contentDOM: HTMLElement
  getPos: boolean | (() => number)
  tableStyle: Record<string, string>
  tableWrapperStyle: Record<string, string>

  constructor(node: ProseMirrorNode, editor: Editor, getPos: boolean | (() => number)) {
    this.node = node
    this.editor = editor
    this.getPos = getPos
    this.cellMinWidth = 100
    this.dom = document.createElement('div')
    this.tableWrapper = document.createElement('div')
    this.dom = this.tableWrapper
    this.tableWrapper.classList.add('tableWrapper', 'tiptap-widget')
    this.tableWrapper.draggable = false
    this.table = this.tableWrapper.appendChild(document.createElement('table'))
    this.colgroup = this.table.appendChild(document.createElement('colgroup'))

    this.tableStyle = node.attrs.style
    this.tableWrapperStyle = node.attrs.styleTableWrapper
    updateTableStyle(this)

    updateColumnsOnResize(node, this.colgroup, this.table, this.cellMinWidth)
    this.contentDOM = this.table.appendChild(document.createElement('tbody'))

    new TableFocus(this, this.editor as ExitusEditor)
    new UpDownTable(this, this.editor as ExitusEditor)
    this.tableCellBalloon = new TableCellBalloon(editor as ExitusEditor)

    const toolbar = new Toolbar(editor as ExitusEditor, ['colTable', 'rowTable', 'cellTable', 'tableProperties', 'cellProperties'])

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
        return new ItensModalTable(this.editor as ExitusEditor, node.attrs.style).render()
      }
    )
    toolbar.setButton('cellProperties', {
      icon: starredCell,
      click: () => {
        this.tableCellBalloon.updatePosition()
        this.balloon.hide()
        clickCellHandler(this)
      },
      tooltip: 'Propriedades da célula'
    })

    this.balloon = new Balloon(editor, {
      position: BalloonPosition.TOP
    })

    this.balloon.ballonPanel.appendChild(toolbar.render())

    this.tableWrapper.appendChild(this.balloon.getBalloon())

    clickHandler(this)
  }

  selectNode() {
    this.tableWrapper.draggable = false
  }

  deselectNode() {
    this.tableWrapper.classList.remove('ex-selected')
  }

  updateAttributes(attributes: Record<string, any>) {
    if (typeof this.getPos === 'function') {
      const { view } = this.editor
      const { state, dispatch } = view

      if (view.dom.contains(document.activeElement)) {
        const tr = state.tr.setNodeMarkup(this.getPos(), undefined, {
          ...this.node.attrs,
          ...attributes
        })
        dispatch(tr)
      }
    }
  }

  destroy() {
    this.balloon.destroy()
    this.tableCellBalloon.destroy()
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) {
      return false
    }

    this.node = node

    this.tableStyle = node.attrs.style
    this.tableWrapperStyle = node.attrs.styleTableWrapper
    updateTableStyle(this)
    updateColumnsOnResize(node, this.colgroup, this.table, this.cellMinWidth)

    return true
  }

  stopEvent(event: Event) {
    if (event instanceof KeyboardEvent) {
      return true
    }
    return false
  }

  ignoreMutation(mutation: ViewMutationRecord | { type: 'selection'; target: Element }) {
    if (mutation.type === 'attributes' && this.balloon.ballonMenu.contains(mutation.target)) {
      return true
    }
    //@ts-ignore
    if (mutation.type === 'attributes' && mutation.target.classList.contains('ex-dropdown')) {
      return true
    }

    if (mutation.type === 'selection' && (mutation.target as Element).closest('.baloon-menu')) {
      return true
    }

    return (
      mutation.type === 'attributes' &&
      (mutation.target === this.tableWrapper || mutation.target === this.table || this.colgroup.contains(mutation.target))
    )
  }
}
function updateTableStyle(tableView: TableView) {
  const { tableWrapperStyle, tableWrapper, table, tableStyle } = tableView
  table.setAttribute('style', objParaCss({ ...tableStyle, width: '100%' }))
  tableWrapper.setAttribute('style', objParaCss(tableWrapperStyle))
}
