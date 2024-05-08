import { type Editor } from '@tiptap/core'

import { type Toolbar } from '../toolbar/Toolbar'

export interface BallonnEventProps {
  toolbar: Toolbar
}
export interface BalloonOptions {
  arrow: 'top' | 'bottom'
}

export class Balloon {
  ballonMenu!: HTMLDivElement
  ballonPanel!: HTMLDivElement
  editor: Editor
  options: BalloonOptions = {
    arrow: 'bottom'
  }
  constructor(editor: Editor, options?: BalloonOptions) {
    this.editor = editor
    this.options = {
      ...this.options,
      ...options
    }
    this.render()
  }

  render() {
    this.ballonMenu = document.createElement('div')
    this.ballonMenu.className = 'balloon-menu ex-hidden'

    this.ballonPanel = this.ballonMenu.appendChild(document.createElement('div'))

    this.ballonPanel.classList.add('balloon-panel', this.options.arrow == 'bottom' ? 'balloon-arrow-bottom-center' : 'balloon-arrow-top-center')

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
    requestAnimationFrame(() => {
      const rect = this.ballonMenu.getBoundingClientRect()
      console.log(rect.width, rect.height)
    })
  }

  hide() {
    this.ballonMenu.classList.add('ex-hidden')
  }
}
