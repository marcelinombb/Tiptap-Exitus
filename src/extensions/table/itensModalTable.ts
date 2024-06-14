/* eslint-disable no-console */
//@ts-nocheck
import { Button, Dropdown } from '@editor/ui'
import textDl from '@icons/image-left.svg'
import textDm from '@icons/image-middle.svg'
import textDr from '@icons/image-right.svg'
import Pickr from '@simonwep/pickr'
import type ExitusEditor from 'src/ExitusEditor'
import '@simonwep/pickr/dist/themes/nano.min.css'

const createPickrInstance = (selector: string, onCancel: () => void): Pickr => {
  const pickr = Pickr.create({
    el: selector,
    theme: 'nano',
    swatches: [
      'rgba(230, 77, 77, 1)',
      'rgba(230, 153, 77, 1)',
      'rgba(230, 230, 77, 1)',
      'rgba(153, 230, 77, 1)',
      'rgba(77, 153, 230, 1)',
      'rgba(77, 77, 230, 1)',
      'rgba(153, 77, 230, 1)'
    ],
    components: {
      preview: true,
      opacity: false,
      hue: true,
      interaction: {
        hex: true,
        rgba: true,
        hsla: false,
        hsva: false,
        cmyk: false,
        input: true,
        cancel: true,
        save: true
      }
    }
  })

  pickr.on('cancel', onCancel)

  return pickr
}

function fecharDropdownsAbertos() {
  Dropdown.instances.forEach(dropdown => dropdown.off())
}

function showDropdown({ dropdown }: any) {
  if (dropdown.isOpen) {
    dropdown.off()
  } else {
    dropdown.on()
  }
}

export function criaTabelaModal(style: any) {
  return ({ editor }) => {
    const dropdown = new Dropdown(editor, {
      events: {
        open: showDropdown
      },
      classes: ['ex-dropdown-balloonModal'],
      fecha: false
    })
    dropdown.setDropDownContent(new ItensModalTable(editor, style).render())
    return dropdown
  }
}

export class ItensModalTable {
  private editor: ExitusEditor
  private style: any
  private selectInput: HTMLSelectElement
  private cellBackgroundColorPickr: Pickr | null
  private larguraBloco1: HTMLInputElement
  private cellBorderColorPickr: Pickr | null
  private inputAltura: HTMLInputElement
  private inputLargura: HTMLInputElement

  constructor(editor: ExitusEditor, style: any) {
    this.editor = editor
    this.style = style

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

    const [size = '', border = 'none'] = (this.style.border ?? '').split(' ')

    this.selectInput.value = border

    this.larguraBloco1 = createInput('number', 'Largura')
    this.larguraBloco1.className = 'ex-largura1'
    this.larguraBloco1.disabled = true
    this.larguraBloco1.style.cursor = 'not-allowed'
    this.larguraBloco1.value = size.replace('px', '')

    this.cellBorderColorPickr = null
    this.cellBackgroundColorPickr = null

    this.inputAltura = createInput('number', 'Altura')
    this.inputAltura.className = 'ex-inputDimensoes'
    this.inputAltura.value = style.height ? style.height.replace('em', '') : ''

    this.inputLargura = createInput('number', 'Largura')
    this.inputLargura.className = 'ex-inputDimensoes'
    this.inputLargura.value = style.width ? style.width.replace('em', '') : ''
  }

  public render() {
    const dropdownContent = document.createElement('div')
    dropdownContent.className = 'ex-dropdownList-content'
    dropdownContent.contentEditable = 'false'

    dropdownContent.addEventListener('click', event => {
      event.stopPropagation()
    })

    const propriedadesLabel = document.createElement('strong')
    propriedadesLabel.textContent = 'Propriedades da Tabela'
    dropdownContent.appendChild(propriedadesLabel)

    const hr = document.createElement('hr')
    dropdownContent.appendChild(hr)

    this.larguraBloco1.addEventListener('change', () => {
      this.aplicarEstiloBorda()
    })

    this.selectInput.addEventListener('change', () => {
      this.toggleBorderInputs()
      this.aplicarEstiloBorda()
    })

    const bloco1 = document.createElement('div')
    bloco1.className = 'ex-bloco1'

    const bordaLabel = document.createElement('strong')
    bordaLabel.className = 'ex-labels'
    bordaLabel.textContent = 'Borda'
    bordaLabel.style.marginTop = '10px'

    const borderColorElement = document.createElement('div')
    borderColorElement.className = 'color-picker-border'

    bloco1.append(bordaLabel, this.selectInput, this.larguraBloco1, borderColorElement)
    dropdownContent.appendChild(bloco1)

    const corFundoLabel = document.createElement('strong')
    corFundoLabel.textContent = 'Cor de Fundo'
    corFundoLabel.className = 'ex-labels'

    const bloco2 = document.createElement('div')
    bloco2.className = 'ex-bloco2'
    const backgroundColorElement = document.createElement('div')
    backgroundColorElement.className = 'color-picker-background'

    bloco2.append(corFundoLabel, backgroundColorElement)
    dropdownContent.appendChild(bloco2)

    document.body.appendChild(dropdownContent)

    this.cellBorderColorPickr = createPickrInstance('.color-picker-border', () => {
      this.cellBorderColorPickr?.hide()
    })
    this.cellBorderColorPickr.disable()

    this.cellBackgroundColorPickr = createPickrInstance('.color-picker-background', () => {
      this.cellBackgroundColorPickr?.hide()
    })

    this.cellBorderColorPickr.on('save', (color: any) => {
      const rgbaColor = color.toRGBA().toString()
      this.cellBorderColorPickr?.hide()
      this.aplicarEstiloBorda(rgbaColor)
    })

    this.cellBackgroundColorPickr.on('save', (corFundo: any) => {
      const rgbaColor = corFundo.toRGBA().toString()
      this.cellBackgroundColorPickr?.hide()
      this.aplicarEstiloCelulas(rgbaColor)
    })

    this.inputAltura.addEventListener('change', () => {
      this.aplicarDimensoesTabela()
    })

    this.inputLargura.addEventListener('change', () => {
      this.aplicarDimensoesTabela()
    })

    const dimensoesLabel = document.createElement('strong')
    dimensoesLabel.textContent = 'Dimensões'
    dimensoesLabel.className = 'ex-labels'

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

    const bloco8 = document.createElement('div')
    bloco8.className = 'ex-bloco8'

    const TableEsquerda = createButton(this.editor, textDl, () => {
      this.editor.commands.setWrapperStyle({
        'margin-right': 'auto',
        'margin-left': '0'
      })
    })

    const TableMeio = createButton(this.editor, textDm, () => {
      this.editor.commands.setWrapperStyle({
        'margin-right': 'auto',
        'margin-left': 'auto'
      })
    })

    const TableDireito = createButton(this.editor, textDr, () => {
      this.editor.commands.setWrapperStyle({
        'margin-right': '0',
        'margin-left': 'auto'
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
      const borderColor = this.cellBorderColorPickr?.getColor()?.toRGBA()?.toString() ?? ''
      const backgroundColor = this.cellBackgroundColorPickr?.getColor()?.toRGBA()?.toString() ?? ''
      this.aplicarEstiloBorda(borderColor)
      this.aplicarEstiloCelulas(backgroundColor)
      this.aplicarDimensoesTabela()
      fecharDropdownsAbertos()
    })
    botaoConfirma.className = 'ex-botaoSalvar'
    botaoConfirma.appendChild(iconConfirma)

    // Botão de cancelar
    const botaoCancela = createButton(this.editor, 'Cancelar', () => {
      this.editor.commands.setTableStyle({
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

  private aplicarEstiloBorda(cor: string = '') {
    const selectedValue = this.selectInput.value
    const largura = this.larguraBloco1.value

    if (selectedValue && cor && largura) {
      this.editor.commands.setTableStyle({
        border: `${largura}px ${selectedValue} ${cor}`
      })
    }
  }

  private toggleBorderInputs() {
    const isBorderNone = this.selectInput.value === 'none'
    this.larguraBloco1.disabled = isBorderNone
    this.larguraBloco1.style.cursor = isBorderNone ? 'not-allowed' : 'default'
    this.cellBorderColorPickr.setColor(isBorderNone ? 'rgba(0, 0, 0, 0)' : this.cellBorderColorPickr.getColor().toRGBA().toString())
    this.cellBorderColorPickr?.enable()
  }

  private aplicarEstiloCelulas(cor: string = '') {
    if (cor) {
      this.editor.commands.setTableStyle({
        background: cor
      })
    }
  }

  private aplicarDimensoesTabela() {
    const altura = this.inputAltura.value
    const largura = this.inputLargura.value
    if (altura && largura) {
      this.editor.commands.setTableStyle({
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
