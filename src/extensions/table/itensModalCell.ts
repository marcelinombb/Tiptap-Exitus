import { Button, Dropdown, type DropDownEventProps } from '@editor/ui'
import textDr from '@icons/align-bottom.svg'
import textDl from '@icons/align-top.svg'
import textDm from '@icons/align-vertically.svg'
import { selectionCell } from '@tiptap/pm/tables'
import type ExitusEditor from 'src/ExitusEditor'

function fecharDropdownsAbertos() {
  Dropdown.instances.forEach(dropdown => dropdown.off())
}

function saveBorderValue({ dropdown, editor }: DropDownEventProps) {
  const { nodeAfter } = selectionCell(editor.view.state)
  const [size = '', border = 'none', color = ''] = (nodeAfter?.attrs.style.border ?? '').split(' ')

  const borda = dropdown.dropdownContent.querySelector<HTMLInputElement>('.ex-selectInput')
  const larguraInput = dropdown.dropdownContent.querySelector<HTMLInputElement>('.ex-largura1')
  const colorInputBorda = dropdown.dropdownContent.querySelector<HTMLInputElement>('.ex-colorInput')

  if (larguraInput && borda && colorInputBorda) {
    larguraInput.value = size
    borda.value = border
    colorInputBorda.value = color
  }
}

function saveBackValue({ dropdown, editor }: DropDownEventProps) {
  const { nodeAfter } = selectionCell(editor.view.state)

  const back = (nodeAfter?.attrs.style.background ?? '').split(' ')

  const backInput = dropdown.dropdownContent.querySelector<HTMLInputElement>('.ex-colorInput2')

  if (backInput) {
    backInput.value = back
  }
}

function saveSizeValue({ dropdown, editor }: DropDownEventProps) {
  const { nodeAfter } = selectionCell(editor.view.state)

  const altura = nodeAfter?.attrs.style.height ?? ''
  const largura = nodeAfter?.attrs.style.width ?? ''

  const alturaInput = dropdown.dropdownContent.querySelector<HTMLInputElement>('.ex-inputDimensoes')
  const larguraInput = dropdown.dropdownContent.querySelector<HTMLInputElement>('.ex-inputDimensoesLargura')

  if (alturaInput && larguraInput) {
    alturaInput.value = altura.replace('px', '')
    larguraInput.value = largura.replace('px', '')
  }
}

function showDropdown(dropDownEvent: DropDownEventProps) {
  saveBorderValue(dropDownEvent)
  saveBackValue(dropDownEvent)
  saveSizeValue(dropDownEvent)

  if (dropDownEvent.dropdown.isOpen) {
    dropDownEvent.dropdown.off()
  } else {
    dropDownEvent.dropdown.on()
  }
}

export function criaCellModal() {
  return ({ editor }: any) => {
    const dropdown = new Dropdown(editor, {
      events: {
        open: showDropdown
      },
      classes: ['ex-dropdown-balloonModal']
    })

    dropdown.setDropDownContent(itensModalCell(editor))
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

function itensModalCell(editor: ExitusEditor) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = '.ex-dropdownList-content'
  dropdownContent.contentEditable = 'false'

  const propriedadesLabel = document.createElement('strong')
  propriedadesLabel.textContent = 'Propriedades da Célula'
  dropdownContent.appendChild(propriedadesLabel)

  const hr = document.createElement('hr')
  dropdownContent.appendChild(hr)

  //bloco 1
  const selectInput = document.createElement('select')
  selectInput.className = 'ex-selectInput'
  selectInput.style.width = '80px'

  const cellStyles: { [key: string]: string } = {
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

  Object.entries(cellStyles).forEach(([name, value]) => {
    const option = document.createElement('option')
    option.value = value
    option.textContent = name
    selectInput.appendChild(option)
  })

  const inputBackgroundColor1 = createInput('color', 'Cor de Fundo')
  inputBackgroundColor1.className = 'ex-colorInput'
  inputBackgroundColor1.disabled = true

  const larguraBloco1 = createInput('number', 'Largura')
  larguraBloco1.className = 'ex-largura1'
  larguraBloco1.disabled = true

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
      editor.commands.setCellAttribute({
        border: `${largura}px ${selectedValue} ${cor}`
      })
    }
  }
  larguraBloco1.addEventListener('change', aplicarEstiloBorda)
  selectInput.addEventListener('change', aplicarEstiloBorda)
  inputBackgroundColor1.addEventListener('change', aplicarEstiloBorda)
  larguraBloco1.value = ''

  //bloco2
  const corFundoLabel = document.createElement('strong')
  corFundoLabel.textContent = 'Cor de Fundo'
  corFundoLabel.className = 'ex-labels'
  dropdownContent.appendChild(corFundoLabel)

  const inputBackgroundColor2 = createInput('color', 'Cor de Fundo')
  inputBackgroundColor2.className = 'ex-colorInput2'
  dropdownContent.appendChild(inputBackgroundColor2)

  const bloco2 = document.createElement('div')
  bloco2.className = 'ex-bloco2'

  bloco2.appendChild(corFundoLabel)
  bloco2.appendChild(inputBackgroundColor2)
  dropdownContent.appendChild(bloco2)

  function aplicarEstiloCelulas() {
    const cor2 = inputBackgroundColor2.value

    if (cor2) {
      editor.commands.setCellAttribute({
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
  dropdownContent.appendChild(inputAltura)

  const vezesSpan = document.createElement('span')
  vezesSpan.textContent = '×'
  dropdownContent.appendChild(vezesSpan)

  const inputLargura = createInput('text', 'Largura')
  inputLargura.className = 'ex-inputDimensoesLargura'
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
      ;(editor.commands as any).setCellAttribute({
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
    ;(editor.commands as any).setCellAttribute({
      'vertical-align': 'top'
    })
  })

  const TableMeio = createButton(editor, textDm, () => {
    ;(editor.commands as any).setCellAttribute({
      'vertical-align': 'middle'
    })
  })

  const TableDireito = createButton(editor, textDr, () => {
    ;(editor.commands as any).setCellAttribute({
      'vertical-align': 'bottom'
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

  function fecharDropdownSeCliqueFora(event: MouseEvent) {
    if (!dropdownContent.contains(event.target as Node)) {
      fecharDropdownsAbertos()
      document.removeEventListener('click', fecharDropdownSeCliqueFora)
    }
  }

  // Bloco 7
  const botaoConfirma = createButton(editor, 'Salvar', () => {
    aplicarEstiloBorda()
    //aplicarEstiloCelulas()
    aplicarDimencoesTabela()
    fecharDropdownsAbertos()
    document.removeEventListener('click', fecharDropdownSeCliqueFora)
  })

  botaoConfirma.className = 'ex-botaoSalvar'
  const iconeConfirma = document.createElement('span')
  iconeConfirma.className = 'ex-icone-confirmacao'
  botaoConfirma.appendChild(iconeConfirma)
  dropdownContent.appendChild(botaoConfirma)

  const botaoCancela = createButton(editor, 'Cancelar', () => {
    fecharDropdownsAbertos()
    document.removeEventListener('click', fecharDropdownSeCliqueFora)
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

  document.addEventListener('click', fecharDropdownSeCliqueFora)

  return dropdownContent
}
