import { type Editor } from '@tiptap/core'

import Toolbar from '../../editor/toolbar/Toolbar'
import type ExitusEditor from '../../ExitusEditor'

import { type ButtonConfig } from './Button'

export interface BallonnEventProps {
  toolbar: Toolbar
}

export interface BalloonConfig extends Omit<ButtonConfig, 'events'> {
  events: {
    [key: string]: (ballonEvent: BallonnEventProps) => any
  }
}

export interface BalloonOptions {
  toolbarOrder: string[]
  configStorage: {
    [key: string]: { toolbarButtonConfig: BalloonConfig | BalloonConfig[] }
  }
}

export class Balloon {
  toolbar!: Toolbar
  balloonOptions: BalloonOptions
  ballonMenu!: HTMLDivElement
  ballonPanel!: HTMLDivElement
  ballonArrow!: HTMLDivElement
  editor: Editor

  constructor(editor: Editor, balloonOptions: BalloonOptions) {
    this.balloonOptions = balloonOptions
    this.editor = editor
  }

  render() {
    this.ballonMenu = document.createElement('div')
    this.ballonMenu.className = 'baloon-menu'
    this.ballonMenu.style.display = 'none'

    this.ballonPanel = this.ballonMenu.appendChild(document.createElement('div'))
    this.ballonPanel.className = 'baloon-panel ex-toolbar-editor'
    this.toolbar = new Toolbar(this.editor as ExitusEditor, this.ballonPanel, this.balloonOptions.toolbarOrder)

    for (const key in this.balloonOptions.configStorage) {
      const config = this.balloonOptions.configStorage[key]

      const toolbarButtonConfigs = Array.isArray(config.toolbarButtonConfig) ? config.toolbarButtonConfig : [config.toolbarButtonConfig]

      toolbarButtonConfigs.forEach(conf => {
        conf.events.click = conf.events.click({
          toolbar: this.toolbar
        })
      })
    }

    this.toolbar.createToolbar(this.balloonOptions.configStorage)

    this.ballonArrow = this.ballonMenu.appendChild(document.createElement('div'))
    this.ballonArrow.className = 'baloon-arrow'

    this.ballonMenu.append(this.ballonPanel, this.ballonArrow)
    return this.ballonMenu
  }
}
