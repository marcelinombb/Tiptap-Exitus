import { objParaCss } from '@editor/utils'
import type ExitusEditor from '@src/ExitusEditor'
import { type Editor } from '@tiptap/core'
import { type Node as ProseMirrorNode } from '@tiptap/pm/model'
import { type NodeView, type ViewMutationRecord } from '@tiptap/pm/view'

import { updateColumnsOnResize } from './prosemirror-tables/src'
import { TableBalloonToolbar } from './TableBalloonToolbar'
import TableFocus, { UpDownTable } from './tableFocus'

function clickHandler(tableView: TableView) {
  tableView.table.addEventListener('click', () => {
    if (typeof tableView.getPos === 'function') {
      tableView.tableBalloonToolbar.updatePosition(tableView.getPos())
    }

    function clickOutside(event: Event) {
      const target = event.target as HTMLElement

      if (target.closest('.pcr-app') !== null) {
        return
      }

      if (target.closest('.tableWrapper') == null) {
        tableView.tableBalloonToolbar.balloon.hide()
        tableView.tableWrapper.classList.remove('ex-selected')
        window.removeEventListener('click', clickOutside)
      }
    }

    window.addEventListener('click', clickOutside)
  })
}

export class TableView implements NodeView {
  node: ProseMirrorNode
  dom: Element
  table: HTMLTableElement
  colgroup: HTMLTableColElement
  tableBalloonToolbar: TableBalloonToolbar
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
    this.cellMinWidth = 30
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
    updateColumnsOnResize(node, this.colgroup, this.tableWrapper as HTMLTableElement, this.cellMinWidth)

    this.contentDOM = this.table.appendChild(document.createElement('tbody'))

    new TableFocus(this, this.editor as ExitusEditor)
    new UpDownTable(this, this.editor as ExitusEditor)

    this.tableBalloonToolbar = TableBalloonToolbar.getInstance(editor, node.attrs.style)

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
    this.tableBalloonToolbar.balloon.destroy()
    //this.tableCellBalloon.destroy()
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) {
      return false
    }

    this.node = node
    this.tableStyle = node.attrs.style
    this.tableWrapperStyle = node.attrs.styleTableWrapper

    updateTableStyle(this)
    updateColumnsOnResize(node, this.colgroup, this.tableWrapper as HTMLTableElement, this.cellMinWidth)
    if (typeof this.getPos === 'function') {
      this.tableBalloonToolbar.updatePosition(this.getPos())
    }
    return true
  }

  stopEvent(event: Event) {
    if (event instanceof KeyboardEvent) {
      return true
    }
    return false
  }

  ignoreMutation(mutation: ViewMutationRecord | { type: 'selection'; target: Element }) {
    if (mutation.type === 'attributes' && this.tableBalloonToolbar.balloon.ballonMenu.contains(mutation.target)) {
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
  table.setAttribute('style', objParaCss({ ...tableStyle }))
  tableWrapper.setAttribute('style', objParaCss(tableWrapperStyle))
}
