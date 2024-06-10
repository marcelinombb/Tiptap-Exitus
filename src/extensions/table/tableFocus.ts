import { Button } from '@editor/ui'
import { insertParagraph } from '@editor/utils'
import setaCima from '@icons/corner-down-left-line.svg'
import setaBaixo from '@icons/corner-down-right-line.svg'
import selecionaIcon from '@icons/select-all.svg'
import { type Editor } from '@tiptap/core'
import { NodeSelection } from '@tiptap/pm/state'

import { type TableView } from './TableView'

export class UpDownTable {
  tableView: TableView
  FocarCima!: HTMLElement
  FocarBaixo!: HTMLElement
  editor: Editor

  constructor(tableView: TableView, editor: Editor) {
    this.tableView = tableView
    this.editor = editor
    this.focaTabela(editor)
  }

  private focaTabela(editor: Editor) {
    const element = this.tableView.tableWrapper
    element.style.position = 'relative'

    const botaoCima = this.createButton(editor, setaCima, () => {
      if (typeof this.tableView.getPos == 'function') {
        const pos = this.tableView.getPos()
        insertParagraph(this.editor, pos, true)
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

  private createButton(editor: Editor, icone: string, onClick: () => void): HTMLElement {
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

  constructor(tableView: TableView, editor: Editor) {
    this.tableView = tableView
    this.getTable(editor)
  }

  private handleClick() {
    const { view } = this.tableView.editor

    if (typeof this.tableView.getPos === 'function') {
      const transaction = view.state.tr.setSelection(NodeSelection.create(view.state.doc, this.tableView.getPos()))
      view.dispatch(transaction)
    }
  }

  private getTable(editor: Editor) {
    const element = this.tableView.tableWrapper
    element.style.position = 'relative'

    const pegaTabela = this.createButton(editor, selecionaIcon, () => {
      this.handleClick()
    })
    this.selectTable = element.appendChild(pegaTabela)
    this.selectTable.classList.add('ex-pegaTabela')
  }

  private createButton(editor: Editor, icone: string, onClick: () => void): HTMLElement {
    const button = new Button(editor, {
      icon: icone,
      classList: ['ex-getTable']
    })
    button.bind('click', onClick)
    return button.render()
  }
}
