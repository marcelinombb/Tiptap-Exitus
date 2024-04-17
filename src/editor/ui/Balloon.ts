import type ExitusEditor from '../../ExitusEditor'
import type Toolbar from '../toolbar'

interface BalloonOptions {
  toolbarOrder: string[]
  configStorage: {
    [key: string]: { toolbarButtonConfig: object | object[] }
  }
}

export class Balloon {
  toolbar!: Toolbar
  balloonOptions: BalloonOptions
  ballonMenu!: HTMLDivElement
  ballonPanel!: HTMLDivElement
  ballonArrow!: HTMLDivElement

  constructor(balloonOptions: BalloonOptions) {
    this.balloonOptions = balloonOptions
  }

  render() {
    this.ballonMenu = document.createElement('div')
    this.ballonMenu.className = 'baloon-menu'
    this.ballonMenu.style.display = 'none'

    this.ballonPanel = this.ballonMenu.appendChild(document.createElement('div'))
    this.ballonPanel.className = 'baloon-panel ex-toolbar-editor'

    this.ballonArrow = this.ballonMenu.appendChild(document.createElement('div'))
    this.ballonArrow.className = 'baloon-arrow'

    this.ballonMenu.append(this.ballonPanel, this.ballonArrow)
    return this.ballonMenu
  }
}
