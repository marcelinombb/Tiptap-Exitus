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

import { Button, type ButtonEventProps, Dropdown } from '../../editor/ui'
import { Balloon } from '../../editor/ui/Balloon'

function clickHandler(table: TableView) {
  table.tableWrapper.addEventListener('click', event => {
    //event.stopPropagation()
    console.log('jkadfs')
    table.updateAttributes({
      ballonActive: true
    })
    ///table.classList.add('ex-selected')
    /*    const balloonMenu = table.querySelector('.baloon-menu') as HTMLElement
    console.log(balloonMenu)

    if (balloonMenu) {
      if (balloonMenu.style.display === 'none') {
        balloonMenu.style.display = 'block'
      }
    }

    window.addEventListener('click', function (event) {
      const target = event.target as HTMLElement

      if (!target.matches('.tableWrapper')) {
        balloonMenu.style.display = 'none'
        table.classList.remove('ex-selected')
      }
    }) */
  })
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
  }
}

export class TableView implements NodeView {
  node: ProseMirrorNode
  dom: Element
  table: HTMLElement
  colgroup: Element
  balloon: Balloon
  editor: Editor
  tableWrapper: HTMLElement
  contentDOM: Element

  constructor(node: ProseMirrorNode, editor: Editor) {
    this.node = node
    this.editor = editor
    this.dom = document.createElement('div')
    this.tableWrapper = document.createElement('div')
    this.tableWrapper.classList.add('tableWrapper', 'tiptap-widget')

    this.table = this.tableWrapper.appendChild(document.createElement('table'))
    this.colgroup = this.table.appendChild(document.createElement('colgroup'))
    this.contentDOM = this.table.appendChild(document.createElement('tbody')) as HTMLElement
    console.log('sdlkfd')

    const configStorage = {
      celumnsTable: {
        toolbarButtonConfig: {
          icon: tableColumns,
          label: 'coluna',
          events: {
            click: null
          }
        }
      },
      RowTable: {
        toolbarButtonConfig: {
          icon: tableRow,
          label: 'linha',
          events: {
            click: null
          }
        }
      },
      cellTable: {
        toolbarButtonConfig: {
          icon: tableCell,
          label: 'mesclar células',
          events: {
            click: null
          }
        }
      },
      tableStarred: {
        toolbarButtonConfig: {
          icon: starredTable + arrowDropDown,
          label: 'Aumentar e diminuir imagem',
          events: {
            click: null
          }
        }
      },
      cellStarred: {
        toolbarButtonConfig: {
          icon: starredCell + arrowDropDown,
          label: 'Aumentar e diminuir imagem',
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
    const balloonMenu = this.tableWrapper.querySelector('.baloon-menu') as HTMLElement
    console.log(node)

    balloonMenu.style.display = node.attrs.ballonActive ? 'block' : 'none'
    this.dom.appendChild(this.tableWrapper)

    clickHandler(this)
  }

  updateAttributes(attributes: Record<string, any>) {
    this.editor.commands.updateAttributes(this.node.type, attributes)
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) {
      return false
    }
    //console.log(node.attrs)

    this.node = node
    //updateColumns(node, this.colgroup, this.table, this.cellMinWidth)

    return true
  }

  ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element }) {
    return mutation.type === 'attributes' && (mutation.target === this.table || this.colgroup.contains(mutation.target))
  }
}
