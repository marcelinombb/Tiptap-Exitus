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
      const { view } = this.editor
      const rectBalloon = this.ballonMenu.getBoundingClientRect()
      const rectEditor = view.dom.getBoundingClientRect()
      const spanRect = (this.ballonMenu.parentElement as Element).getBoundingClientRect()

      if (spanRect.width > rectBalloon.width) {
        this.ballonMenu.classList.add('balloon-menu-middle')
        this.ballonMenu.classList.remove('balloon-menu-right', 'balloon-menu-left')
        return
      }

      const isOverflowLeft = overFlowLeft(spanRect.x, rectEditor.left, rectBalloon.width)
      const isOverflowRight = overFlowRight(spanRect.x, rectEditor.right, rectBalloon.width)

      if (isOverflowLeft && !isOverflowRight) {
        this.setBalloonMenuClass('balloon-menu-left', `balloon-arrow-${this.options.arrow}-left`)
      } else if (isOverflowRight && !isOverflowLeft) {
        this.setBalloonMenuClass('balloon-menu-right', `balloon-arrow-${this.options.arrow}-right`)
      } else {
        this.setBalloonMenuClass('balloon-menu-middle', `balloon-arrow-${this.options.arrow}-center`)
      }
    })
  }

  setBalloonMenuClass(menuClass: string, arrowClass: string) {
    this.ballonMenu.classList.remove('balloon-menu-left', 'balloon-menu-right', 'balloon-menu-middle')
    this.ballonPanel.classList.remove(
      `balloon-arrow-${this.options.arrow}-left`,
      `balloon-arrow-${this.options.arrow}-right`,
      `balloon-arrow-${this.options.arrow}-center`
    )
    this.ballonMenu.classList.add(menuClass)
    this.ballonPanel.classList.add(arrowClass)
  }

  hide() {
    this.ballonMenu.classList.add('ex-hidden')
  }
}

function overFlowRight(balloonX: number, editorTR: number, balloonWidth: number) {
  const middle = balloonWidth / 2
  //console.log('overFlowRight', rectBalloon.x + middle, rectEditor.right)

  return balloonX + middle > editorTR
}

function overFlowLeft(balloonX: number, editorTl: number, balloonWidth: number) {
  const middle = balloonWidth / 2

  //console.log('overFlowLeft', rectBalloon.x - middle, rectEditor.left)

  return balloonX - middle < editorTl
}
