/* eslint-disable no-console */
import { Button, Dropdown } from '@editor/ui'
import textDl from '@icons/image-left.svg'
import textDm from '@icons/image-middle.svg'
import textDr from '@icons/image-right.svg'
import type ExitusEditor from 'src/ExitusEditor'

function fecharDropdownsAbertos() {
  Dropdown.instances.forEach(dropdown => dropdown.off())
}

function showDropdown({ dropdown }: any) {
  // event.stopPropagation()
  if (dropdown.isOpen) {
    dropdown.off()
  } else {
    dropdown.on()
  }
}

export function criaTabelaModal(style: any) {
  return ({ editor }: any) => {
    const dropdown = new Dropdown(editor, {
      events: {
        open: showDropdown
      },
      classes: ['ex-dropdown-balloonModal']
    })

    dropdown.setDropDownContent(itensModalTable(editor, style))
    return dropdown
  }
}

function createButton(editor: ExitusEditor, icone: string, onClick: () => void) {
  const button = new Button(editor, {
    icon: icone
  })

  button.bind('click', () => {
    console.log(button.getButtonElement().parentElement?.querySelectorAll('button'))
    button
      .getButtonElement()
      .parentElement?.querySelectorAll('button')
      .forEach(button => button.classList.remove('ex-button-active'))

    if (button.getButtonElement().classList.contains('ex-button-active')) {
      button.off()
    } else {
      button.on()
    }
    onClick()
  })

  return button.render()
}
function createInput(type: string, placeholder: string) {
  const input = document.createElement('input')
  input.type = type
  input.contentEditable = 'true'
  input.placeholder = placeholder

  return input
}

function itensModalTable(editor: ExitusEditor, style: any) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = '.ex-dropdownList-content'
  dropdownContent.contentEditable = 'false'

  const propriedadesLabel = document.createElement('strong')
  propriedadesLabel.textContent = 'Propriedades da Tabela'
  dropdownContent.appendChild(propriedadesLabel)

  const hr = document.createElement('hr')
  dropdownContent.appendChild(hr)

  const [size = '', border = 'none', color = ''] = (style.border ?? '').split(' ')

  //bloco 1
  const selectInput = document.createElement('select')
  selectInput.style.width = '80px'
  selectInput.value = border
  const borderStyles = {
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
    option.selected = value == border
    selectInput.appendChild(option)
  })

  const inputBackgroundColor1 = createInput('color', 'Cor de Fundo')
  inputBackgroundColor1.className = 'ex-colorInput'
  inputBackgroundColor1.disabled = true

  inputBackgroundColor1.value = color

  const larguraBloco1 = createInput('number', 'Largura')
  larguraBloco1.className = 'ex-largura1'
  larguraBloco1.disabled = true
  larguraBloco1.value = size.replace('px', '')

  const bloco1 = document.createElement('div')
  bloco1.className = 'ex-bloco1'

  const bordaLabel = document.createElement('strong')
  bordaLabel.className = 'ex-labels'
  bordaLabel.textContent = 'Borda'

  bloco1.append(bordaLabel, selectInput, inputBackgroundColor1, larguraBloco1)
  dropdownContent.appendChild(bloco1)

  selectInput.addEventListener('change', () => {
    if (selectInput.value) {
      inputBackgroundColor1.disabled = false
    }
  })

  inputBackgroundColor1.addEventListener('change', () => {
    if (inputBackgroundColor1.value) {
      larguraBloco1.disabled = false
    }
  })

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
  selectInput.addEventListener('change', aplicarEstiloBorda)
  inputBackgroundColor1.addEventListener('change', aplicarEstiloBorda)
  //larguraBloco1.value = ''

  //bloco2
  const corFundoLabel = document.createElement('strong')
  corFundoLabel.textContent = 'Cor de Fundo'
  corFundoLabel.className = 'ex-labels'
  dropdownContent.appendChild(corFundoLabel)

  const colorBack = style.background

  const inputBackgroundColor2 = createInput('color', 'Cor de Fundo')
  inputBackgroundColor2.className = 'ex-colorInput2'

  inputBackgroundColor2.value = colorBack

  dropdownContent.appendChild(inputBackgroundColor2)

  const bloco2 = document.createElement('div')
  bloco2.className = 'ex-bloco2'

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

  dimensoesLabel.className = 'ex-labels'
  dropdownContent.appendChild(dimensoesLabel)

  const inputAltura = createInput('text', 'Altura')
  inputAltura.className = 'ex-inputDimensoes'

  const height = style.height
  if (style.height) {
    inputAltura.value = height
    inputAltura.value = height.replace('px', '')
  }

  dropdownContent.appendChild(inputAltura)

  const vezesSpan = document.createElement('span')
  vezesSpan.textContent = '×'
  dropdownContent.appendChild(vezesSpan)

  const inputLargura = createInput('text', 'Largura')
  inputLargura.className = 'ex-inputDimensoes'

  const width = style.width
  if (style.width) {
    inputLargura.value = width
    inputLargura.value = width.replace('px', '')
  }
  dropdownContent.appendChild(inputLargura)

  const bloco6 = document.createElement('div')
  bloco6.className = 'ex-bloco6'
  bloco6.append(inputAltura, vezesSpan, inputLargura)

  const bloco3 = document.createElement('div')
  bloco3.className = 'ex-bloco3'

  bloco3.appendChild(dimensoesLabel)
  bloco3.appendChild(bloco6)

  dropdownContent.appendChild(bloco3)

  function aplicarDimencoesTabela() {
    const altura = inputAltura.value
    const largura = inputLargura.value
    if (altura && largura) {
      ;(editor.commands as any).setTableStyle({
        height: `${altura}px`,
        width: `${largura}px`
      })
    }
  }
  inputLargura.addEventListener('change', aplicarDimencoesTabela)

  inputAltura.addEventListener('change', aplicarDimencoesTabela)

  //bloco 4
  const alinhamentoLabel = document.createElement('strong')
  alinhamentoLabel.textContent = 'Alinhamento'
  alinhamentoLabel.className = 'ex-labels'
  dropdownContent.appendChild(alinhamentoLabel)

  const bloco8 = document.createElement('div')
  bloco8.className = 'ex-bloco8'

  const TableEsquerda = createButton(editor, textDl, () => {
    ;(editor.commands as any).setWrapperStyle({
      Direita: 'auto',
      Esquerda: '0'
    })
  })

  const TableMeio = createButton(editor, textDm, () => {
    ;(editor.commands as any).setWrapperStyle({
      Direita: 'auto',
      Esquerda: 'auto'
    })
  })
  const TableDireito = createButton(editor, textDr, () => {
    ;(editor.commands as any).setWrapperStyle({
      Direita: '0',
      Esquerda: 'auto'
    })
  })

  bloco8.append(TableEsquerda, TableMeio, TableDireito)

  const bloco4 = document.createElement('div')
  bloco4.className = 'ex-bloco4'
  bloco4.appendChild(alinhamentoLabel)
  bloco4.appendChild(bloco8)
  dropdownContent.appendChild(bloco4)

  //bloco 5
  const bloco5 = document.createElement('div')
  bloco5.className = 'ex-bloco5'
  bloco5.appendChild(bloco3)
  bloco5.appendChild(bloco4)
  dropdownContent.appendChild(bloco5)

  //bloco7
  const botaoConfirma = createButton(editor, 'Salvar', () => {
    aplicarEstiloBorda()
    //aplicarEstiloCelulas()
    aplicarDimencoesTabela()
    fecharDropdownsAbertos()
  })
  botaoConfirma.className = 'ex-botaoSalvar'
  const iconeConfirma = document.createElement('span')
  iconeConfirma.className = 'ex-icone-confirmacao'
  botaoConfirma.appendChild(iconeConfirma)
  dropdownContent.appendChild(botaoConfirma)

  const botaoCancela = createButton(editor, 'Cancelar', () => {
    ;(editor.commands as any).setWrapperStyle({
      Direita: 'auto',
      Esquerda: 'auto'
    })
    ;(editor.commands as any).setTableStyle({
      height: ``,
      width: ``,
      background: ``,
      border: ``
    })
    fecharDropdownsAbertos()
  })
  botaoCancela.className = 'ex-botaoCancela'
  const iconeCancela = document.createElement('span')
  iconeCancela.className = 'ex-icone-cancelamento'
  botaoCancela.appendChild(iconeCancela)
  dropdownContent.appendChild(botaoCancela)

  const bloco7 = document.createElement('div')
  bloco7.className = 'ex-bloco7'
  bloco7.append(botaoConfirma, botaoCancela)
  dropdownContent.appendChild(bloco7)

  return dropdownContent
}
