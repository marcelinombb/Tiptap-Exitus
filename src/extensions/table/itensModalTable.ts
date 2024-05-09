import { Button, Dropdown } from '@editor/ui'
import textDl from '@icons/image-left.svg'
import textDm from '@icons/image-middle.svg'
import textDr from '@icons/image-right.svg'
import { Editor } from '@tiptap/core'
import type ExitusEditor from 'src/ExitusEditor'

let dropdownsAbertos: Dropdown[] = []

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

  const borderStyles: { [key: string]: string } = {
    'sem borda': 'none',
    sólida: 'solid',
    pontilhada: 'dotted',
    tracejada: 'dashed',
    dupla: 'double',
    ranhura: 'ridge',
    crista: 'groove',
    'baixo relevo': 'inset',
    'alto relevo': 'outset'
  }

  Object.entries(borderStyles).forEach(([name, value]) => {
    const option = document.createElement('option')
    option.value = value
    option.textContent = name
    selectInput.appendChild(option)
  })

  const inputBackgroundColor1 = createInput('color', 'Cor de Fundo')
  inputBackgroundColor1.className = 'colorInput'

  const larguraBloco1 = createInput('text', 'Largura')
  larguraBloco1.className = 'largura1'

  const bloco1 = document.createElement('div')
  bloco1.className = 'bloco1'

  const bordaLabel = document.createElement('strong')
  bordaLabel.className = 'labels'
  bordaLabel.textContent = 'Borda'

  bloco1.append(bordaLabel, selectInput, inputBackgroundColor1, larguraBloco1)

  dropdownContent.appendChild(bloco1)

  function aplicarEstiloBorda() {
    const selectedValue = selectInput.value
    const cor = inputBackgroundColor1.value
    const largura = larguraBloco1.value

    if (selectedValue && cor && largura) {
      ;(editor.commands as any).setTableStyle({
        border: `${largura}px ${selectedValue} ${cor}`
      })
    }
  }

  larguraBloco1.addEventListener('change', aplicarEstiloBorda)
  larguraBloco1.value = ''

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

  function aplicarEstiloCelulas() {
    const cor2 = inputBackgroundColor2.value

    if (cor2) {
      ;(editor.commands as any).setTableStyle({
        background: cor2
      })
    }
  }

  inputBackgroundColor2.addEventListener('change', aplicarEstiloCelulas)
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
