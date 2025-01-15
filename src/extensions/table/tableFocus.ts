import { Button } from '@editor/ui'
import { insertParagraph } from '@editor/utils'
import setaCima from '@icons/corner-down-left-line.svg'
import setaBaixo from '@icons/corner-down-right-line.svg'
import selecionaIcon from '@icons/select-all.svg'
import type ExitusEditor from '@src/ExitusEditor'
import { type Editor } from '@tiptap/core'

import { type TableView } from './TableView'

export class UpDownTable {
  tableView: TableView
  FocarCima!: HTMLElement
  FocarBaixo!: HTMLElement
  editor: Editor

  constructor(tableView: TableView, editor: ExitusEditor) {
    this.tableView = tableView
    this.editor = editor
    this.focaTabela(editor)
  }

  private focaTabela(editor: ExitusEditor) {
    const element = this.tableView.tableWrapper
    element.style.position = 'relative'

    const botaoCima = this.createButton(editor, setaCima, () => {
      if (typeof this.tableView.getPos == 'function') {
        const pos = this.tableView.getPos()
        insertParagraph(this.editor, pos)
      }
    })
    this.FocarCima = element.appendChild(botaoCima)
    this.FocarCima.classList.add('ex-bolinha', 'ex-bolinha-cima')

    const botaoBaixo = this.createButton(editor, setaBaixo, () => {
      if (typeof this.tableView.getPos == 'function') {
        const pos = this.tableView.getPos() as number
        insertParagraph(this.editor, pos + this.tableView.node.nodeSize)
      }
    })
    this.FocarBaixo = element.appendChild(botaoBaixo)
    this.FocarBaixo.classList.add('ex-bolinha', 'ex-bolinha-baixo')
  }

  private createButton(editor: ExitusEditor, icone: string, onClick: () => void): HTMLElement {
    const button = new Button(editor, {
      icon: icone,
      classList: ['ex-bolinha']
    })
    button.bind('click', onClick)
    return button.render()
  }
}

export default class TableFocus {
  tableView: TableView
  selectTable!: HTMLElement

  constructor(tableView: TableView, editor: ExitusEditor) {
    this.tableView = tableView
    this.getTable(editor)
  }

  private handleClick() {
    this.tableView.tableWrapper.classList.add('ex-selected')
  }

  private getTable(editor: ExitusEditor) {
    const element = this.tableView.tableWrapper
    element.style.position = 'relative'

    const pegaTabela = this.createButton(editor, selecionaIcon, () => {
      this.handleClick()
    })
    this.selectTable = element.appendChild(pegaTabela)
    this.selectTable.classList.add('ex-focus-table')
  }

  private createButton(editor: ExitusEditor, icone: string, onClick: () => void): HTMLElement {
    const button = new Button(editor, {
      icon: icone,
      classList: ['ex-getTable']
    })
    button.button.addEventListener('pointerdown', onClick)
    return button.render()
  }
}
