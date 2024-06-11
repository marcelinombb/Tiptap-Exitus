import { Balloon, Button } from '@editor/ui'
import { getNodeBoundingClientRect } from '@editor/utils'
import textDr from '@icons/align-bottom.svg'
import textDl from '@icons/align-top.svg'
import textDm from '@icons/align-vertically.svg'
import { type Editor } from '@tiptap/core'
import { type Attrs, type ResolvedPos } from '@tiptap/pm/model'
import { selectionCell } from '@tiptap/pm/tables'

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
      this.balloon.show()
    } catch (error) {
      console.error(error)
    }
  }
}

export class ItensModalCell {
  private editor: Editor
  private cellBorderStyles: HTMLSelectElement
  private cellBorderColor: HTMLInputElement
  private cellBorderWidth: HTMLInputElement
  private cellBackgroundColor: HTMLInputElement
  private cellHeight: HTMLInputElement
  private cellWidth: HTMLInputElement
  selectedCell!: ResolvedPos
  balloon: TableCellBalloon

  constructor(editor: Editor, balloon: TableCellBalloon) {
    this.editor = editor
    this.cellBorderStyles = document.createElement('select')
    this.cellBorderStyles.style.width = '80px'
    this.cellBorderStyles.className = 'ex-selectInput'
    this.balloon = balloon
    const borderStyles = {
      'sem borda': 'none',
      // eslint-disable-next-line prettier/prettier
      'sólida': 'solid',
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

    this.cellBorderColor = createInput('color', 'Cor de Fundo')
    this.cellBorderColor.className = 'ex-colorInput'
    this.cellBorderColor.disabled = true
    this.cellBorderColor.style.cursor = 'not-allowed'

    this.cellBorderWidth = createInput('number', 'Largura')
    this.cellBorderWidth.className = 'ex-largura1'
    this.cellBorderWidth.disabled = true
    this.cellBorderWidth.style.cursor = 'not-allowed'

    this.cellBackgroundColor = createInput('color', 'Cor de Fundo')
    this.cellBackgroundColor.className = 'ex-colorInput2'
    //this.cellBackgroundColor.value = style.background

    this.cellHeight = createInput('number', 'Altura')
    this.cellHeight.className = 'ex-inputDimensoes'

    this.cellWidth = createInput('number', 'Largura')
    this.cellWidth.className = 'ex-inputDimensoes'
  }

  setSelectedCell(selectedCell: ResolvedPos) {
    this.selectedCell = selectedCell
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
      this.cellBorderColor.value = color
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
      this.cellBorderColor.value = ''
    }
  }

  updateBackGroundValue(attr: Attrs) {
    if (attr?.background) {
      this.cellBackgroundColor.value = attr.background
    } else {
      this.cellBackgroundColor.value = ''
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
    dropdownContent.className = 'ex-dropdownList-content'
    dropdownContent.contentEditable = 'false'

    const propriedadesLabel = document.createElement('strong')
    propriedadesLabel.textContent = 'Propriedades da Celula'
    dropdownContent.appendChild(propriedadesLabel)

    const hr = document.createElement('hr')
    dropdownContent.appendChild(hr)

    this.cellBorderStyles.addEventListener('change', () => {
      if (this.cellBorderStyles.value) {
        this.cellBorderColor.disabled = false
        this.cellBorderColor.style.cursor = 'pointer'
      }
    })

    this.cellBorderColor.addEventListener('change', () => {
      if (this.cellBorderColor.value) {
        this.cellBorderWidth.disabled = false
        this.cellBorderWidth.style.cursor = 'pointer'
      }
    })

    this.cellBorderWidth.addEventListener('change', () => {
      this.aplicarEstiloBorda()
    })

    this.cellBorderStyles.addEventListener('change', () => {
      this.aplicarEstiloBorda()
    })

    this.cellBorderColor.addEventListener('change', () => {
      this.aplicarEstiloBorda()
    })

    this.cellBackgroundColor.addEventListener('change', () => {
      this.aplicarEstiloCelulas()
    })

    this.cellHeight.addEventListener('change', () => {
      this.aplicarDimensoesTabela()
    })

    this.cellWidth.addEventListener('change', () => {
      this.aplicarDimensoesTabela()
    })

    const bloco1 = document.createElement('div')
    bloco1.className = 'ex-bloco1'

    const bordaLabel = document.createElement('strong')
    bordaLabel.className = 'ex-labels'
    bordaLabel.textContent = 'Borda'
    bordaLabel.style.marginTop = '10px'

    bloco1.append(bordaLabel, this.cellBorderStyles, this.cellBorderColor, this.cellBorderWidth)
    dropdownContent.appendChild(bloco1)

    const corFundoLabel = document.createElement('strong')
    corFundoLabel.textContent = 'Cor de Fundo'
    corFundoLabel.className = 'ex-labels'
    dropdownContent.appendChild(corFundoLabel)

    dropdownContent.appendChild(this.cellBackgroundColor)

    const bloco2 = document.createElement('div')
    bloco2.className = 'ex-bloco2'
    bloco2.appendChild(corFundoLabel)
    bloco2.appendChild(this.cellBackgroundColor)
    dropdownContent.appendChild(bloco2)

    const dimensoesLabel = document.createElement('strong')
    dimensoesLabel.textContent = 'Dimensões'
    dimensoesLabel.className = 'ex-labels'
    dropdownContent.appendChild(dimensoesLabel)

    const bloco6 = document.createElement('div')
    bloco6.className = 'ex-bloco6'
    bloco6.append(this.cellHeight, (document.createElement('span').textContent = '×'), this.cellWidth)

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
      this.editor.commands.setCellAttributes(this.selectedCell, {
        'vertical-align': 'top'
      })
    })

    const TableMeio = createButton(this.editor, textDm, () => {
      this.editor.commands.setCellAttributes(this.selectedCell, {
        'vertical-align': 'middle'
      })
    })

    const TableDireito = createButton(this.editor, textDr, () => {
      this.editor.commands.setCellAttributes(this.selectedCell, {
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
      this.aplicarEstiloBorda()
      this.aplicarDimensoesTabela()
      this.balloon.off()
    })
    botaoConfirma.className = 'ex-botaoSalvar'
    botaoConfirma.appendChild(iconConfirma)

    // Botão de cancelar
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

  private aplicarEstiloBorda() {
    const selectedValue = this.cellBorderStyles.value
    const cor = this.cellBorderColor.value
    const largura = this.cellBorderWidth.value

    if (selectedValue && cor && largura) {
      this.editor.commands.setCellAttributes(this.selectedCell, {
        border: `${largura}px ${selectedValue} ${cor}`
      })
    }
  }

  private aplicarEstiloCelulas() {
    const cor2 = this.cellBackgroundColor.value

    if (cor2) {
      this.editor.commands.setCellAttributes(this.selectedCell, {
        background: cor2
      })
    }
  }

  public aplicarDimensoesTabela() {
    const altura = this.cellHeight.value
    const largura = this.cellWidth.value
    if (altura && largura) {
      this.editor.commands.setCellAttributes(this.selectedCell, {
        height: `${altura}px`,
        width: `${largura}px`
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
