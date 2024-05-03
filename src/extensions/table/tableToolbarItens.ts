import { Button, Dropdown } from '@editor/ui'
import { Balloon } from '@editor/ui/Balloon'
import textDl from '@icons/image-left.svg'
import textDm from '@icons/image-middle.svg'
import textDr from '@icons/image-right.svg'
import { Editor } from '@tiptap/core'
import Table from '@tiptap/extension-table'
import { type Node as ProseMirrorNode } from '@tiptap/pm/model'
import { type NodeView } from '@tiptap/pm/view'
import type ExitusEditor from 'src/ExitusEditor'

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

export function criaDropColuna() {
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
  const linhaE = linhaEsquerda(editor, dropdown, 'adicionar linha em cima')
  const linhaD = linhaDireita(editor, dropdown, 'adicionar linha em baixo')
  const linhaDel = linhaDelete(editor, dropdown, 'deletar linha')

  dropdownContent?.append(linhaHead, linhaD, linhaE, linhaDel)

  return dropdownContent
}

export function criaDropLinhas() {
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
  const cellSplit = splitCell(editor, dropdown, 'dividir células')

  dropdownContent?.append(cellHead, cellMerge, cellSplit)

  return dropdownContent
}

export function criaDropCell() {
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

export function criaTabelaModal() {
  return ({ editor }: any) => {
    const dropdown = new Dropdown(editor, {
      events: {
        open: showDropdown
      },
      classes: ['ex-dropdown-balloonModal']
    })

    dropdown.setDropDownContent(itensModalTable(editor))

    /* window.addEventListener('click', function (event: Event) {
      const target = event.target as HTMLElement
      if (!target.matches('.dropdown')) {
        dropdown.off()
      }
    }) */

    return dropdown
  }
}

function createButton(editor: ExitusEditor, icone: string, onClick: () => void) {
  const button = new Button(editor, {
    icon: icone,
    events: {
      click: onClick
    }
  })

  return button.render()
}

function createInput(type: string, placeholder: string) {
  const input = document.createElement('input')
  input.type = type
  input.placeholder = placeholder

  return input
}

function itensModalTable(editor: ExitusEditor) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = '.ex-dropdownList-content'

  const propriedadesLabel = document.createElement('label')
  propriedadesLabel.textContent = 'Propriedades da Tabela'
  dropdownContent.appendChild(propriedadesLabel)

  const hr = document.createElement('hr')
  dropdownContent.appendChild(hr)

  //bloco 1

  const selectInput = document.createElement('select')
  selectInput.style.width = '80px'
  const borderStyles = ['sem borda', 'sólida', 'pontilhada', 'tracejada', 'dupla', 'ranhura', 'crista', 'baixo relevo', 'alto relevo']
  borderStyles.forEach(style => {
    const option = document.createElement('option')
    option.value = style
    option.textContent = style
    selectInput.appendChild(option)
  })
  dropdownContent.appendChild(selectInput)

  const inputBackgroundColor1 = createInput('color', 'Cor de Fundo')
  inputBackgroundColor1.className = 'colorInput'
  dropdownContent.appendChild(inputBackgroundColor1)

  const larguraBloco1 = createInput('text', 'Largura')
  larguraBloco1.className = 'largura1'
  dropdownContent.appendChild(larguraBloco1)

  const bloco1 = document.createElement('div')
  bloco1.className = 'bloco1'

  const bordaLabel = document.createElement('strong')
  bordaLabel.className = 'labels'
  bordaLabel.textContent = 'Borda'

  bloco1.appendChild(bordaLabel)
  bloco1.appendChild(selectInput)
  bloco1.appendChild(inputBackgroundColor1)
  bloco1.appendChild(larguraBloco1)
  dropdownContent.appendChild(bloco1)

  //bloco2
  const corFundoLabel = document.createElement('strong')
  corFundoLabel.textContent = 'Cor de Fundo'
  corFundoLabel.className = 'labels'
  dropdownContent.appendChild(corFundoLabel)

  const inputBackgroundColor2 = createInput('color', 'Cor de Fundo')
  inputBackgroundColor2.className = 'colorInput2'
  dropdownContent.appendChild(inputBackgroundColor2)

  const bloco2 = document.createElement('div')
  bloco2.className = 'bloco2'

  bloco2.appendChild(corFundoLabel)
  bloco2.appendChild(inputBackgroundColor2)
  dropdownContent.appendChild(bloco2)

  //bloco3
  const dimensoesLabel = document.createElement('strong')
  dimensoesLabel.textContent = 'Dimensões'

  dimensoesLabel.className = 'labels'
  dropdownContent.appendChild(dimensoesLabel)

  const inputAltura = createInput('text', 'Altura')
  inputAltura.className = 'inputDimensoes'
  dropdownContent.appendChild(inputAltura)

  const vezesSpan = document.createElement('span')
  vezesSpan.textContent = '×'
  dropdownContent.appendChild(vezesSpan)

  const inputLargura = createInput('text', 'Largura')
  inputLargura.className = 'inputDimensoes'
  dropdownContent.appendChild(inputLargura)

  const bloco6 = document.createElement('div')
  bloco6.className = 'bloco6'
  bloco6.append(inputAltura, vezesSpan, inputLargura)

  const bloco3 = document.createElement('div')
  bloco3.className = 'bloco3'

  bloco3.appendChild(dimensoesLabel)
  bloco3.appendChild(bloco6)

  dropdownContent.appendChild(bloco3)

  //bloco 4
  const alinhamentoLabel = document.createElement('strong')
  alinhamentoLabel.textContent = 'Alinhamento'
  alinhamentoLabel.className = 'labels'
  dropdownContent.appendChild(alinhamentoLabel)

  const bloco8 = document.createElement('div')
  bloco8.className = 'bloco8'

  const TableEsquerda = createButton(editor, textDl, () => {})

  const TableMeio = createButton(editor, textDm, () => {})

  const TableDireito = createButton(editor, textDr, () => {})

  bloco8.append(TableEsquerda, TableMeio, TableDireito)

  const bloco4 = document.createElement('div')
  bloco4.className = 'bloco4'
  bloco4.appendChild(alinhamentoLabel)
  bloco4.appendChild(bloco8)
  dropdownContent.appendChild(bloco4)

  //bloco 5
  const bloco5 = document.createElement('div')
  bloco5.className = 'bloco5'
  bloco5.appendChild(bloco3)
  bloco5.appendChild(bloco4)
  dropdownContent.appendChild(bloco5)

  //bloco7
  const botaoConfirma = createButton(editor, 'Salvar', () => {
    // o que acontece quando clicar no botão
  })
  botaoConfirma.className = 'botaoSalvar'
  const iconeConfirma = document.createElement('span')
  iconeConfirma.className = 'icone-confirmacao'
  botaoConfirma.appendChild(iconeConfirma)
  dropdownContent.appendChild(botaoConfirma)

  const botaoCancela = createButton(editor, 'Cancelar', () => {
    // o que acontece quando clicar no botão
  })
  botaoCancela.className = 'botaoCancela'
  const iconeCancela = document.createElement('span')
  iconeCancela.className = 'icone-cancelamento'
  botaoCancela.appendChild(iconeCancela)
  dropdownContent.appendChild(botaoCancela)

  const bloco7 = document.createElement('div')
  bloco7.className = 'bloco7'
  bloco7.append(botaoConfirma, botaoCancela)
  dropdownContent.appendChild(bloco7)

  return dropdownContent
}
