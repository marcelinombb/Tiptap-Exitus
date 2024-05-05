import { type Editor } from '@tiptap/core'

import { type Toolbar } from '../toolbar/Toolbar'

import { type ButtonConfig } from './Button'

export interface BallonnEventProps {
  toolbar: Toolbar
}

export interface BalloonConfig extends Omit<ButtonConfig, 'events'> {
  events: {
    [key: string]: (ballonEvent: BallonnEventProps) => any
  }
}

export class Balloon {
  ballonMenu!: HTMLDivElement
  ballonPanel!: HTMLDivElement
  editor: Editor

  constructor(editor: Editor) {
    this.editor = editor
    this.render()
  }

  render() {
    this.ballonMenu = document.createElement('div')
    this.ballonMenu.className = 'balloon-menu ex-hidden'

    this.ballonPanel = this.ballonMenu.appendChild(document.createElement('div'))
    this.ballonPanel.className = 'balloon-panel'

    //this.ballonPanel.append(this.toolbar.createToolbar())

    this.ballonMenu.append(this.ballonPanel)
  }

  getBalloon() {
    return this.ballonMenu
  }

  isOpen() {
    return !this.ballonMenu.classList.contains('ex-hidden')
  }

  show() {
    this.ballonMenu.classList.remove('ex-hidden')
  }

  hide() {
    this.ballonMenu.classList.add('ex-hidden')
  }
}
