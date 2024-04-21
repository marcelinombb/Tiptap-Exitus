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
  toolbar!: Toolbar
  ballonMenu!: HTMLDivElement
  ballonPanel!: HTMLDivElement
  ballonArrow!: HTMLDivElement
  editor: Editor

  constructor(editor: Editor, toolbar: Toolbar) {
    this.editor = editor
    this.toolbar = toolbar
  }

  render() {
    this.ballonMenu = document.createElement('div')
    this.ballonMenu.className = 'baloon-menu'
    this.ballonMenu.style.display = 'none'

    this.ballonPanel = this.ballonMenu.appendChild(document.createElement('div'))
    this.ballonPanel.className = 'baloon-panel ex-toolbar-editor'

    this.toolbar.createToolbar(this.ballonPanel)

    this.ballonArrow = this.ballonMenu.appendChild(document.createElement('div'))
    this.ballonArrow.className = 'baloon-arrow'

    this.ballonMenu.append(this.ballonPanel, this.ballonArrow)
    return this.ballonMenu
  }
}
