//@ts-nocheck
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

    dropdown.setDropDownContent(new ItensModalCell(editor).render())
    return dropdown
  }
}
export class ItensModalCell {
  private editor: ExitusEditor
  private selectInput: HTMLSelectElement
  private inputBackgroundColor1: HTMLInputElement
  private larguraBloco1: HTMLInputElement
  private inputBackgroundColor2: HTMLInputElement
  private inputAltura: HTMLInputElement
  private inputLargura: HTMLInputElement

  constructor(editor: ExitusEditor) {
    this.editor = editor

    this.selectInput = document.createElement('select')
    this.selectInput.style.width = '80px'

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
      this.selectInput.appendChild(option)
    })

    this.inputBackgroundColor1 = createInput('color', 'Cor de Fundo')
    this.inputBackgroundColor1.className = 'ex-colorInput'
    this.inputBackgroundColor1.disabled = true

    this.larguraBloco1 = createInput('number', 'Largura')
    this.larguraBloco1.className = 'ex-largura1'
    this.larguraBloco1.disabled = true

    this.inputBackgroundColor2 = createInput('color', 'Cor de Fundo')
    this.inputBackgroundColor2.className = 'ex-colorInput2'
    //this.inputBackgroundColor2.value = style.background

    this.inputAltura = createInput('number', 'Altura')
    this.inputAltura.className = 'ex-inputDimensoes'

    this.inputLargura = createInput('number', 'Largura')
    this.inputLargura.className = 'ex-inputDimensoes'
  }

  public render() {
    const dropdownContent = document.createElement('div')
    dropdownContent.className = '.ex-dropdownList-content'
    dropdownContent.contentEditable = 'false'

   /*  dropdownContent.addEventListener('click', event => {
      event.stopPropagation()
    }) */

    const propriedadesLabel = document.createElement('strong')
    propriedadesLabel.textContent = 'Propriedades da Tabela'
    dropdownContent.appendChild(propriedadesLabel)

    const hr = document.createElement('hr')
    dropdownContent.appendChild(hr)

    this.selectInput.addEventListener('change', () => {
      if (this.selectInput.value) {
        this.inputBackgroundColor1.disabled = false
      }
    })

    this.inputBackgroundColor1.addEventListener('change', () => {
      if (this.inputBackgroundColor1.value) {
        this.larguraBloco1.disabled = false
      }
    })

    this.larguraBloco1.addEventListener('change', () => {
      this.aplicarEstiloBorda()
    })

    this.selectInput.addEventListener('change', () => {
      this.aplicarEstiloBorda()
    })

    this.inputBackgroundColor1.addEventListener('change', () => {
      this.aplicarEstiloBorda()
    })

    this.inputBackgroundColor2.addEventListener('change', () => {
      this.aplicarEstiloCelulas()
    })

    this.inputAltura.addEventListener('change', () => {
      this.aplicarDimensoesTabela()
    })

    this.inputLargura.addEventListener('change', () => {
      this.aplicarDimensoesTabela()
    })

    const bloco1 = document.createElement('div')
    bloco1.className = 'ex-bloco1'

    const bordaLabel = document.createElement('strong')
    bordaLabel.className = 'ex-labels'
    bordaLabel.textContent = 'Borda'
    bordaLabel.style.marginTop = '10px'

    bloco1.append(bordaLabel, this.selectInput, this.inputBackgroundColor1, this.larguraBloco1)
    dropdownContent.appendChild(bloco1)

    const corFundoLabel = document.createElement('strong')
    corFundoLabel.textContent = 'Cor de Fundo'
    corFundoLabel.className = 'ex-labels'
    dropdownContent.appendChild(corFundoLabel)

    dropdownContent.appendChild(this.inputBackgroundColor2)

    const bloco2 = document.createElement('div')
    bloco2.className = 'ex-bloco2'
    bloco2.appendChild(corFundoLabel)
    bloco2.appendChild(this.inputBackgroundColor2)
    dropdownContent.appendChild(bloco2)

    const dimensoesLabel = document.createElement('strong')
    dimensoesLabel.textContent = 'Dimensões'
    dimensoesLabel.className = 'ex-labels'
    dropdownContent.appendChild(dimensoesLabel)

    const bloco6 = document.createElement('div')
    bloco6.className = 'ex-bloco6'
    bloco6.append(this.inputAltura, (document.createElement('span').textContent = '×'), this.inputLargura)

    const bloco3 = document.createElement('div')
    bloco3.className = 'ex-bloco3'
    bloco3.appendChild(dimensoesLabel)
    bloco3.appendChild(bloco6)
    dropdownContent.appendChild(bloco3)

    const alinhamentoLabel = document.createElement('strong')
    alinhamentoLabel.textContent = 'Alinhamento'
    alinhamentoLabel.className = 'ex-labels'
    dropdownContent.appendChild(alinhamentoLabel)

    const bloco8 = document.createElement('div')
    bloco8.className = 'ex-bloco8'

    const TableEsquerda = createButton(this.editor, textDl, () => {
      ;(this.editor.commands as any).setCellAttribute({
        'vertical-align': 'top'
      })
    })

    const TableMeio = createButton(this.editor, textDm, () => {
      ;(this.editor.commands as any).setCellAttribute({
        'vertical-align': 'middle'
      })
    })

    const TableDireito = createButton(this.editor, textDr, () => {
      ;(this.editor.commands as any).setCellAttribute({
        'vertical-align': 'bottom'
      })
    })

    bloco8.append(TableEsquerda, TableMeio, TableDireito)

    const bloco4 = document.createElement('div')
    bloco4.className = 'ex-bloco4'
    bloco4.appendChild(alinhamentoLabel)
    bloco4.appendChild(bloco8)
    dropdownContent.appendChild(bloco4)

    const bloco5 = document.createElement('div')
    bloco5.className = 'ex-bloco5'
    bloco5.appendChild(bloco3)
    bloco5.appendChild(bloco4)
    dropdownContent.appendChild(bloco5)

    const iconConfirma = document.createElement('span')
    iconConfirma.className = 'ex-icone-confirmacao'

    const iconCancela = document.createElement('span')
    iconCancela.className = 'ex-icone-cancelamento'

    // Botão de salvar
    const botaoConfirma = createButton(this.editor, 'Salvar', () => {
      fecharDropdownsAbertos()
      this.aplicarEstiloBorda()
      this.aplicarDimensoesTabela()
    })
    botaoConfirma.className = 'ex-botaoSalvar'
    botaoConfirma.appendChild(iconConfirma)

    // Botão de cancelar
    const botaoCancela = createButton(this.editor, 'Cancelar', () => {
      this.editor.commands.setCellAttribute({
        height: '',
        width: '',
        background: '',
        border: ''
      })
      fecharDropdownsAbertos()
    })
    botaoCancela.className = 'ex-botaoCancela'
    botaoCancela.appendChild(iconCancela)

    const bloco7 = document.createElement('div')
    bloco7.className = 'ex-bloco7'
    bloco7.append(botaoConfirma, botaoCancela)
    dropdownContent.appendChild(bloco7)

    return dropdownContent
  }

  private aplicarEstiloBorda() {
    const selectedValue = this.selectInput.value
    const cor = this.inputBackgroundColor1.value
    const largura = this.larguraBloco1.value

    if (selectedValue && cor && largura) {
      this.editor.commands.setCellAttribute({
        border: `${largura}px ${selectedValue} ${cor}`
      })
    }
  }

  private aplicarEstiloCelulas() {
    const cor2 = this.inputBackgroundColor2.value

    if (cor2) {
      this.editor.commands.setCellAttribute({
        background: cor2
      })
    }
  }

  public aplicarDimensoesTabela() {
    const altura = this.inputAltura.value
    const largura = this.inputLargura.value
    if (altura && largura) {
      this.editor.commands.setCellAttribute({
        height: `${altura}em`,
        width: `${largura}em`
      })
    }
  }
}

function createInput(type: string, placeholder: string) {
  const input = document.createElement('input')
  input.type = type
  input.contentEditable = 'true'
  input.placeholder = placeholder

  return input
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
