import { Button } from '@editor/ui'
import setaCima from '@icons/corner-down-left-line.svg'
import setaBaixo from '@icons/corner-down-right-line.svg'
import type ExitusEditor from 'src/ExitusEditor'

import { type TableView } from './TableView'

export default class TableFocus {
  tableView: TableView
  FocarCima!: HTMLElement
  FocarBaixo!: HTMLElement

  constructor(tableView: TableView, editor: ExitusEditor) {
    this.tableView = tableView
    this.focaTabela(editor)
  }

  private focaTabela(editor: ExitusEditor) {
    const element = this.tableView.tableWrapper
    element.style.position = 'relative'

    const botaoCima = createButton(editor, setaCima, () => {
      this.moveAlvoParaCima()
    })
    this.FocarCima = element.appendChild(botaoCima)
    this.FocarCima.classList.add('bolinha', 'bolinha-cima')

    const botaoBaixo = createButton(editor, setaBaixo, () => {
      this.moveAlvoParaBaixo()
    })
    this.FocarBaixo = element.appendChild(botaoBaixo)
    this.FocarBaixo.classList.add('bolinha', 'bolinha-baixo')
  }

  private moveAlvoParaCima() {
    const paragrafo = '<p></p>'
    this.tableView.dom.insertAdjacentHTML('beforebegin', paragrafo)
  }

  private moveAlvoParaBaixo() {
    const paragrafo = '<p></p>'
    this.tableView.dom.insertAdjacentHTML('afterend', paragrafo)
  }
}

function createButton(editor: ExitusEditor, icone: string, onClick: () => void) {
  const button = new Button(editor, {
    icon: icone,
    classList: ['bolinha']
  })
  button.bind('click', onClick)
  return button.render()
}
