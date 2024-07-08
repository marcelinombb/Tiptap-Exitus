//@ts-nocheck
import { Button, Dropdown, type DropDownEventProps } from '@editor/ui'
import arrowDropDown from '@icons/arrow-drop-down-line.svg'
import tableCell from '@icons/merge-tableCells.svg'
import tableColumns from '@icons/table-columns.svg'
import tableRow from '@icons/table-lines.svg'
import type ExitusEditor from 'src/ExitusEditor'

let botaoAtivo: Button | null = null

function ativaBotao(button: Button) {
  if (botaoAtivo) {
    botaoAtivo.off()
  }
  button.on()
  botaoAtivo = button
}

function showDropdown({ event, dropdown }: DropDownEventProps) {
  event.stopPropagation()
  if (dropdown.isOpen) {
    dropdown.off()
  } else {
    dropdown.on()
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
    classList: ['ex-mr-0', 'ex-text-left']
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

export function dropDownColunas(editor: ExitusEditor, dropdown: Dropdown) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = 'ex-dropdownList-content'

  const colunaHead = colunaHeader(editor, dropdown, 'Adicionar/remover cabeçalho à coluna')
  const colunaE = colunaEsquerda(editor, dropdown, 'Adicionar coluna à Esquerda')
  const colunaD = colunaDireita(editor, dropdown, 'Adicionar coluna à Direita')
  const colunaDel = colunaDelete(editor, dropdown, 'Deletar coluna')

  dropdownContent?.append(colunaHead, colunaD, colunaE, colunaDel)

  return dropdownContent
}

export function criaDropColuna(editor: ExitusEditor) {
  const dropdown = new Dropdown(editor, {
    icon: tableColumns + arrowDropDown,
    tooltip: 'Coluna',
    click: showDropdown,
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
    classList: ['ex-mr-0', 'ex-text-left']
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

export function dropDownLinhas(editor: ExitusEditor, dropdown: Dropdown) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = 'ex-dropdownList-content'

  const linhaHead = linhaHeader(editor, dropdown, 'Adicionar/remover cabeçalho à linha')
  const linhaE = linhaEsquerda(editor, dropdown, 'Adicionar linha em cima')
  const linhaD = linhaDireita(editor, dropdown, 'Adicionar linha em baixo')
  const linhaDel = linhaDelete(editor, dropdown, 'Deletar linha')

  dropdownContent?.append(linhaHead, linhaD, linhaE, linhaDel)

  return dropdownContent
}

export function criaDropLinhas(editor: ExitusEditor) {
  const dropdown = new Dropdown(editor, {
    icon: tableRow + arrowDropDown,
    tooltip: 'Linha',
    click: showDropdown,
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

function cellHeader(editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0', 'ex-text-left']
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

export function dropDownCell(editor: ExitusEditor, dropdown: Dropdown) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = 'ex-dropdownList-content'

  const cellHead = cellHeader(editor, dropdown, 'Adicionar/remover cabeçalho à célula')
  const cellMerge = mergeCell(editor, dropdown, 'Mesclar células')
  const cellSplit = splitCell(editor, dropdown, 'Dividir células')

  dropdownContent?.append(cellHead, cellMerge, cellSplit)

  return dropdownContent
}

export function criaDropCell(editor: ExitusEditor) {
  const dropdown = new Dropdown(editor, {
    icon: tableCell + arrowDropDown,
    tooltip: 'Mesclar células',
    click: showDropdown,
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
