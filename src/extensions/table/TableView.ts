//@ts-nocheck
import { Toolbar } from '@editor/toolbar'
import arrowDropDown from '@icons/arrow-drop-down-line.svg'
import tableCell from '@icons/merge-tableCells.svg'
import starredCell from '@icons/starred-cell.svg'
import starredTable from '@icons/starred-table.svg'
import tableColumns from '@icons/table-columns.svg'
import tableRow from '@icons/table-lines.svg'
import { type Editor } from '@tiptap/core'
import { type Node as ProseMirrorNode } from '@tiptap/pm/model'
import { type NodeView } from '@tiptap/pm/view'
import type ExitusEditor from 'src/ExitusEditor'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button, Dropdown } from '../../editor/ui'
import { Balloon } from '../../editor/ui/Balloon'

import { criaTabelaModal } from './itensModalTable'
import { criaDropCell, criaDropColuna, criaDropLinhas } from './tableToolbarItens'

function clickHandler(table: TableView) {
  table.tableWrapper.addEventListener('click', event => {
    table.updateAttributes({
      ballonActive: true
    })

    function clickOutside(event) {
      const target = event.target as HTMLElement

      if (target.closest('.tableWrapper') == null) {
        //console.log(target.closest('.tableWrapper'))

        try {
          table.updateAttributes({
            ballonActive: false
          })
        } catch (error) {}
        table.tableWrapper.classList.remove('ex-selected')
        window.removeEventListener('click', clickOutside)
      }
    }

    window.addEventListener('click', clickOutside)
  })
}

export function updateColumns(
  node: ProseMirrorNode,
  colgroup: Element,
  table: HTMLElement,
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
        if ((nextDOM as HTMLElement).style.width !== cssWidth) {
          ;(nextDOM as HTMLElement).style.width = cssWidth
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
  }
}

export class TableView implements NodeView {
  node: ProseMirrorNode
  dom: Element
  table: HTMLElement
  colgroup: Element
  balloon: Balloon
  editor: Editor
  cellMinWidth: number
  tableWrapper: HTMLElement
  contentDOM: HTMLElement
  getPos: boolean | (() => number)

  constructor(node: ProseMirrorNode, editor: Editor, getPos: boolean | (() => number)) {
    this.node = node
    this.editor = editor
    this.getPos = getPos
    this.cellMinWidth = 100
    this.dom = document.createElement('div')
    this.tableWrapper = document.createElement('div')
    this.tableWrapper.classList.add('tableWrapper', 'tiptap-widget')
    console.log('cosntruct')

    this.table = this.tableWrapper.appendChild(document.createElement('table'))
    this.colgroup = this.table.appendChild(document.createElement('colgroup'))
    this.table.setAttribute('style', node.attrs.style)
    updateColumns(node, this.colgroup, this.table, this.cellMinWidth)
    this.contentDOM = this.table.appendChild(document.createElement('tbody'))

    const configStorage = {
      celumnsTable: {
        toolbarButtonConfig: {
          icon: tableColumns + arrowDropDown,
          label: 'coluna',
          dropdown: criaDropColuna()
        }
      },
      RowTable: {
        toolbarButtonConfig: {
          icon: tableRow + arrowDropDown,
          label: 'linha',
          dropdown: criaDropLinhas()
        }
      },
      cellTable: {
        toolbarButtonConfig: {
          icon: tableCell + arrowDropDown,
          label: 'mesclar células',
          dropdown: criaDropCell()
        }
      },
      tableStarred: {
        toolbarButtonConfig: {
          icon: starredTable + arrowDropDown,
          label: 'editar tabela',
          dropdown: criaTabelaModal()
        }
      },
      cellStarred: {
        toolbarButtonConfig: {
          icon: starredCell + arrowDropDown,
          label: 'editar celula',
          events: {
            click: null
          }
        }
      }
    }

    const toolbar = new Toolbar(editor as ExitusEditor, {
      toolbarOrder: ['celumnsTable', 'RowTable', 'cellTable', 'tableStarred', 'cellStarred'],
      configStorage
    })

    this.balloon = new Balloon(editor, toolbar)

    this.tableWrapper.appendChild(this.balloon.render())

    this.dom.appendChild(this.tableWrapper)

    this.balloon.ballonMenu.style.display = this.node.attrs.ballonActive ? 'block' : 'none'

    clickHandler(this)
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

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) {
      return false
    }

    console.log(node.attrs)
    this.node = node
    this.balloon.ballonMenu.style.display = this.node.attrs.ballonActive ? 'block' : 'none'
    this.table.setAttribute('style', node.attrs.style)
    updateColumns(node, this.colgroup, this.table, this.cellMinWidth)

    return true
  }

  ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element }) {
    if (mutation.type === 'attributes' && mutation.target.classList.contains('ex-dropdown')) {
      return true
    }

    if (mutation.type === 'selection' && mutation.target.closest('.baloon-menu')) {
      return true
    }

    return mutation.type === 'attributes' && (mutation.target === this.table || this.colgroup.contains(mutation.target))
  }
}
