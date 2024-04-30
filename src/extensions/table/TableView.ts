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

import { Button, Dropdown } from '../../editor/ui'
import { Balloon } from '../../editor/ui/Balloon'

function clickHandler(table: TableView) {
  table.tableWrapper.addEventListener('click', event => {
    table.updateAttributes({
      ballonActive: true
    })

    window.addEventListener('click', function (event) {
      const target = event.target as HTMLElement

      if (target.closest('.tableWrapper') == null) {
        console.log(target.closest('.tableWrapper'))

        table.updateAttributes({
          ballonActive: false
        })
        table.tableWrapper.classList.remove('ex-selected')
      }
    })
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

let botaoAtivo: Button | null = null
let dropdownsAbertos: Dropdown[] = []

function ativaBotao(button: Button) {
  if (botaoAtivo) {
    botaoAtivo.off()
  }
  button.on()
  botaoAtivo = button
}

function fecharDropdownsAbertos() {
  dropdownsAbertos.forEach(dropdown => {
    dropdown.off()
  })
  dropdownsAbertos = []
}

function showDropdown({ event, dropdown }: any) {
  event.stopPropagation()
  if (dropdown.isOpen) {
    dropdown.off()
    dropdownsAbertos = dropdownsAbertos.filter(d => d !== dropdown)
  } else {
    fecharDropdownsAbertos()
    dropdown.on()
    dropdownsAbertos.push(dropdown)
  }
}
function colunaEsquerda(editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    editor.chain().focus().addColumnBefore().run()
  })

  return button.render()
}

function colunaDireita(editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    editor.chain().focus().addColumnAfter().run()
  })

  return button.render()
}

function colunaHeader(editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    ativaBotao(button)
    editor.chain().focus().toggleHeaderColumn().run()
    if (editor.isActive('HeaderColumn')) {
      button.on()
    } else {
      button.off()
      dropdown.off()
    }
  })

  return button.render()
}

function colunaDelete(editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    editor.chain().focus().deleteColumn().run()
  })

  return button.render()
}

function dropDownColunas(editor: ExitusEditor, dropdown: Dropdown) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = '.ex-dropdownList-content'

  const colunaHead = colunaHeader(editor, dropdown, 'adicionar cabeçalho à coluna')
  const colunaE = colunaEsquerda(editor, dropdown, 'adicionar coluna à Esquerda')
  const colunaD = colunaDireita(editor, dropdown, 'adicionar coluna à Direita')
  const colunaDel = colunaDelete(editor, dropdown, 'deletar coluna')

  dropdownContent?.append(colunaHead, colunaD, colunaE, colunaDel)

  return dropdownContent
}

function criaDropColuna() {
  return ({ editor }: any) => {
    const dropdown = new Dropdown(editor, {
      events: {
        open: showDropdown
      },
      classes: ['ex-dropdown-balloonTable']
    })

    dropdown.setDropDownContent(dropDownColunas(editor, dropdown))

    window.addEventListener('click', function (event: Event) {
      const target = event.target as HTMLElement
      if (!target.matches('.dropdown')) {
        dropdown.off()
      }
    })

    return dropdown
  }
}

function linhaEsquerda(editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    ativaBotao(button)
    editor.chain().focus().addRowBefore().run()
    dropdown.off()
  })

  return button.render()
}

function linhaDireita(editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    ativaBotao(button)
    editor.chain().focus().addRowAfter().run()
  })

  return button.render()
}

function linhaDelete(editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    ativaBotao(button)
    editor.chain().focus().deleteRow().run()
  })

  return button.render()
}

function linhaHeader(editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    ativaBotao(button)
    editor.chain().focus().toggleHeaderRow().run()
    if (editor.isActive('HeaderRow')) {
      button.on()
    } else {
      button.off()
      dropdown.off()
    }
  })

  return button.render()
}

function dropDownLinhas(editor: ExitusEditor, dropdown: Dropdown) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = '.ex-dropdownList-content'

  const linhaHead = linhaHeader(editor, dropdown, 'adicionar cabeçalho à linha')
  const linhaE = linhaEsquerda(editor, dropdown, 'adicionar linha à Esquerda')
  const linhaD = linhaDireita(editor, dropdown, 'adicionar linha à Direita')
  const linhaDel = linhaDelete(editor, dropdown, 'deletar linha')

  dropdownContent?.append(linhaHead, linhaD, linhaE, linhaDel)

  return dropdownContent
}

function criaDropLinhas() {
  return ({ editor }: any) => {
    const dropdown = new Dropdown(editor, {
      events: {
        open: showDropdown
      },
      classes: ['ex-dropdown-balloonTable']
    })

    dropdown.setDropDownContent(dropDownLinhas(editor, dropdown))

    window.addEventListener('click', function (event: Event) {
      const target = event.target as HTMLElement
      if (!target.matches('.dropdown')) {
        dropdown.off()
      }
    })

    return dropdown
  }
}

function cellHeader(editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    ativaBotao(button)
    editor.chain().focus().toggleHeaderCell().run()
    if (editor.isActive('HeaderRow')) {
      button.on()
    } else {
      button.off()
      dropdown.off()
    }
  })

  return button.render()
}

function mergeCell(editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    ativaBotao(button)
    editor.chain().focus().mergeCells().run()
  })

  return button.render()
}

function splitCell(editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    ativaBotao(button)
    editor.chain().focus().splitCell().run()
  })

  return button.render()
}

function dropDownCell(editor: ExitusEditor, dropdown: Dropdown) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = '.ex-dropdownList-content'

  const cellHead = cellHeader(editor, dropdown, 'adicionar cabeçalho à célula')
  const cellMerge = mergeCell(editor, dropdown, 'mesclar células')
  const cellSplit = splitCell(editor, dropdown, 'dividir celulas')

  dropdownContent?.append(cellHead, cellMerge, cellSplit)

  return dropdownContent
}

function criaDropCell() {
  return ({ editor }: any) => {
    const dropdown = new Dropdown(editor, {
      events: {
        open: showDropdown
      },
      classes: ['ex-dropdown-balloonTable']
    })

    dropdown.setDropDownContent(dropDownCell(editor, dropdown))

    window.addEventListener('click', function (event: Event) {
      const target = event.target as HTMLElement
      if (!target.matches('.dropdown')) {
        dropdown.off()
      }
    })

    return dropdown
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
  contentDOM: HTMLElement
  getPos: boolean | (() => number)

  constructor(node: ProseMirrorNode, editor: Editor, getPos: boolean | (() => number)) {
    this.node = node
    this.editor = editor
    this.getPos = getPos
    this.dom = document.createElement('div')
    this.tableWrapper = document.createElement('div')
    this.tableWrapper.classList.add('tableWrapper', 'tiptap-widget')

    this.table = this.tableWrapper.appendChild(document.createElement('table'))
    this.colgroup = this.table.appendChild(document.createElement('colgroup'))
    this.contentDOM = this.table.appendChild(document.createElement('tbody'))
    console.log('TableView')

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
          events: {
            click: null
          }
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

    clickHandler(this)
  }

  updateAttributes(attributes: Record<string, any>) {
    if (typeof this.getPos === 'function') {
      const { view } = this.editor
      const transaction = view.state.tr
      transaction.setNodeMarkup(this.getPos(), undefined, attributes)
      view.dispatch(transaction)
    }
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) {
      return false
    }
    //console.log(node.attrs)
    this.balloon.ballonMenu.style.display = node.attrs.ballonActive ? 'block' : 'none'

    this.node = node

    return true
  }

  ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element }) {
    console.log(mutation)
    if (mutation.type === 'attributes' && mutation.target.classList.contains('ex-dropdown')) {
      return true
    }

    if (mutation.type === 'selection' && mutation.target.closest('.baloon-menu')) {
      return true
    }

    return mutation.type === 'attributes' && (mutation.target === this.table || this.colgroup.contains(mutation.target))
  }
}
