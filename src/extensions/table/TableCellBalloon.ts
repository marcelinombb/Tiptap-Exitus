import { Balloon, Button } from '@editor/ui'
import { getNodeBoundingClientRect } from '@editor/utils'
import textDr from '@icons/align-bottom.svg'
import textDl from '@icons/align-top.svg'
import textDm from '@icons/align-vertically.svg'
import Pickr from '@simonwep/pickr'
import { type Editor } from '@tiptap/core'
import { type Attrs, type ResolvedPos } from '@tiptap/pm/model'
import { selectionCell } from '@tiptap/pm/tables'
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

export class TableCellBalloon {
  balloon: Balloon
  editor: Editor
  itenModal!: ItensModalCell

  constructor(editor: Editor) {
    this.editor = editor
    this.balloon = new Balloon(editor, {
      position: 'float'
    })
    this.itenModal = new ItensModalCell(editor, this)
    this.balloon.setPanelContent(this.itenModal.render())
    editor.view.dom!.parentElement!.appendChild(this.balloon.getBalloon())
  }

  destroy() {
    this.balloon.destroy()
  }

  updateSyleDefaults(resPos: ResolvedPos) {
    const { nodeAfter } = resPos
    this.itenModal.setSelectedCell(resPos)
    this.itenModal.updateStyles(nodeAfter!.attrs)
  }

  off() {
    this.balloon.hide()
  }

  updatePosition() {
    try {
      const resPos = selectionCell(this.editor.view.state)
      const { top, height, left, width } = getNodeBoundingClientRect(this.editor, resPos.pos)
      const main = this.editor.view.dom.getBoundingClientRect()
      this.updateSyleDefaults(resPos)
      this.balloon.setPosition(left - main.left + width / 2, top - main.y + height)
    } catch (error) {
      console.error(error)
    }
  }
}

export class ItensModalCell {
  private editor: Editor
  private cellBorderStyles: HTMLSelectElement
  private cellBorderColorPickr: Pickr | null
  private cellBorderWidth: HTMLInputElement
  private cellBackgroundColorPickr: Pickr | null
  private cellHeight: HTMLInputElement
  private cellWidth: HTMLInputElement
  selectedCell!: ResolvedPos
  balloon: TableCellBalloon

  constructor(editor: Editor, balloon: TableCellBalloon) {
    this.editor = editor
    this.balloon = balloon

    this.cellBorderStyles = document.createElement('select')
    this.cellBorderStyles.style.width = '80px'
    this.cellBorderStyles.className = 'ex-selectInput'

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

    Object.entries(borderStyles).forEach(([name, value], index) => {
      const option = document.createElement('option')
      option.value = value
      if (index === 0) {
        option.setAttribute('selected', 'selected')
      }
      option.textContent = name
      this.cellBorderStyles.appendChild(option)
    })

    this.cellBorderWidth = createInput('number', 'Largura')
    this.cellBorderWidth.className = 'ex-largura1'

    this.cellHeight = createInput('number', 'Altura')
    this.cellHeight.className = 'ex-inputDimensoes'

    this.cellWidth = createInput('number', 'Largura')
    this.cellWidth.className = 'ex-inputDimensoes'

    this.cellBorderColorPickr = null
    this.cellBackgroundColorPickr = null

    this.cellBorderStyles.addEventListener('change', this.handleBorderStyleChange.bind(this))
  }

  setSelectedCell(selectedCell: ResolvedPos) {
    this.selectedCell = selectedCell
  }

  handleBorderStyleChange() {
    const style = this.cellBorderStyles.value
    if (style === 'none') {
      this.cellBorderWidth.disabled = true
      this.cellBorderWidth.style.cursor = 'not-allowed'
      if (this.cellBorderColorPickr) {
        this.cellBorderColorPickr.disable()
      }
    } else {
      this.cellBorderWidth.disabled = false
      this.cellBorderWidth.style.cursor = 'default'
      if (this.cellBorderColorPickr) {
        this.cellBorderColorPickr.enable()
      }
    }
  }

  updateStyles(attrs: Attrs) {
    const attrsObj = attrs.style
    this.updateBackGroundValue(attrsObj)
    this.updateBorderValue(attrsObj)
    this.updateSizeValue(attrsObj)
  }

  updateBorderValue(attr: Attrs) {
    if (attr?.border) {
      const [width, style, color] = attr.border.split(' ')
      this.cellBorderStyles.querySelectorAll('option').forEach(option => {
        if (option.value == style) {
          option.setAttribute('selected', 'selected')
        } else {
          option.removeAttribute('selected')
        }
      })
      this.cellBorderWidth.value = width
      this.cellBorderStyles.value = style
      this.cellBorderColorPickr?.setColor(color)
      this.handleBorderStyleChange()
    } else {
      this.cellBorderStyles.querySelectorAll('option').forEach(option => {
        if (option.value == 'none') {
          option.setAttribute('selected', 'selected')
        } else {
          option.removeAttribute('selected')
        }
      })
      this.cellBorderWidth.value = ''
      this.cellBorderStyles.value = 'none'
      this.cellBorderColorPickr?.setColor('')
      this.handleBorderStyleChange()
    }
  }

  updateBackGroundValue(attr: Attrs) {
    if (attr?.background) {
      this.cellBackgroundColorPickr?.setColor(attr.background)
    } else {
      this.cellBackgroundColorPickr?.setColor('')
    }
  }

  updateSizeValue(attr: Attrs) {
    if (attr && attr?.style) {
      const style = attr.style
      this.cellHeight.value = style?.height?.replace('px', '')
      this.cellWidth.value = style?.width?.replace('px', '')
    } else {
      this.cellHeight.value = ''
      this.cellWidth.value = ''
    }
  }

  public render() {
    const dropdownContent = document.createElement('div')
    dropdownContent.contentEditable = 'false'
    dropdownContent.className = 'ex-p-lg'
    dropdownContent.style.width = '320px'

    const propriedadesLabel = document.createElement('strong')
    propriedadesLabel.textContent = 'Propriedades da Celula'
    dropdownContent.appendChild(propriedadesLabel)

    const hr = document.createElement('hr')
    dropdownContent.appendChild(hr)

    const bloco1 = document.createElement('div')
    bloco1.className = 'ex-bloco1'

    const bordaLabel = document.createElement('strong')
    bordaLabel.className = 'ex-labels'
    bordaLabel.textContent = 'Borda'
    bordaLabel.style.marginTop = '10px'

    const borderColorElement = document.createElement('div')
    borderColorElement.className = 'color-picker-border'

    bloco1.append(bordaLabel, this.cellBorderStyles, this.cellBorderWidth, borderColorElement)
    dropdownContent.appendChild(bloco1)

    const bloco2 = document.createElement('div')
    bloco2.className = 'ex-bloco2'

    const corDeFundoLabel = document.createElement('strong')
    corDeFundoLabel.textContent = 'Cor de Fundo'
    corDeFundoLabel.className = 'ex-labels'
    corDeFundoLabel.style.marginTop = '10px'

    const backgroundColorElement = document.createElement('div')
    backgroundColorElement.className = 'color-picker-background'

    bloco2.append(corDeFundoLabel, backgroundColorElement)
    dropdownContent.appendChild(bloco2)

    document.body.appendChild(dropdownContent)

    this.cellBorderColorPickr = createPickrInstance('.color-picker-border', () => {
      this.balloon.off()
      this.cellBorderColorPickr?.hide()
    })
    this.cellBackgroundColorPickr = createPickrInstance('.color-picker-background', () => {
      this.cellBackgroundColorPickr?.hide()
      this.balloon.off()
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
    this.handleBorderStyleChange()

    const dimensoesLabel = document.createElement('strong')
    dimensoesLabel.textContent = 'Dimensões'
    dimensoesLabel.className = 'ex-labels'
    dropdownContent.appendChild(dimensoesLabel)

    const bloco6 = document.createElement('div')
    bloco6.className = 'ex-bloco6'
    bloco6.append(this.cellHeight, (document.createElement('span').textContent = '×'), this.cellWidth)

    this.cellWidth.addEventListener('change', () => this.aplicarDimensoesTabela())
    this.cellHeight.addEventListener('change', () => this.aplicarDimensoesTabela())

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

    const AlinhaTopo = createButton(this.editor, textDl, () => {
      this.editor.commands.setCellAttributes(this.selectedCell, {
        'vertical-align': 'top'
      })
    })

    const AlinhaMeio = createButton(this.editor, textDm, () => {
      this.editor.commands.setCellAttributes(this.selectedCell, {
        'vertical-align': 'middle'
      })
    })

    const AlinhaBaixo = createButton(this.editor, textDr, () => {
      this.editor.commands.setCellAttributes(this.selectedCell, {
        'vertical-align': 'bottom'
      })
    })

    bloco8.append(AlinhaTopo, AlinhaMeio, AlinhaBaixo)

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

    const botaoConfirma = createButton(this.editor, 'Salvar', () => {
      /* const borderColor = this.cellBorderColorPickr?.getColor()?.toRGBA()?.toString() ?? ''
      const backgroundColor = this.cellBackgroundColorPickr?.getColor()?.toRGBA()?.toString() ?? ''
      this.aplicarEstiloBorda(borderColor)
      this.aplicarEstiloCelulas(backgroundColor)
      this.aplicarDimensoesTabela() */
      this.balloon.off()
    })
    botaoConfirma.className = 'ex-botaoSalvar'
    botaoConfirma.appendChild(iconConfirma)

    const botaoCancela = createButton(this.editor, 'Cancelar', () => {
      this.editor.commands.setCellAttributes(this.selectedCell, {
        height: '',
        width: '',
        background: '',
        border: ''
      })
      this.balloon.off()
    })
    botaoCancela.className = 'ex-botaoCancela'
    botaoCancela.appendChild(iconCancela)

    const bloco7 = document.createElement('div')
    bloco7.className = 'ex-bloco7'
    bloco7.append(botaoConfirma, botaoCancela)
    dropdownContent.appendChild(bloco7)

    return dropdownContent
  }

  private aplicarEstiloBorda(color: string) {
    const selectedValue = this.cellBorderStyles.value
    const width = this.cellBorderWidth.value

    if (selectedValue && color && width) {
      this.editor.commands.setCellAttributes(this.selectedCell, {
        border: `${width}px ${selectedValue} ${color}`
      })
      this.selectedCell = this.editor.view.state.doc.resolve(this.selectedCell.pos)
    }
  }

  private aplicarEstiloCelulas(corFundo: string) {
    if (corFundo) {
      this.editor.commands.setCellAttributes(this.selectedCell, {
        background: corFundo
      })
      this.selectedCell = this.editor.view.state.doc.resolve(this.selectedCell.pos)
    }
  }

  public aplicarDimensoesTabela() {
    const height = this.cellHeight.value
    const width = this.cellWidth.value

    if (height && width) {
      this.editor.commands.setCellAttributes(this.selectedCell, {
        height: `${height}px`,
        width: `${width}px`
      })
      this.selectedCell = this.editor.view.state.doc.resolve(this.selectedCell.pos)
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

function createButton(editor: Editor, icone: string, onClick: () => void) {
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
