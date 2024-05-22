import { type Editor } from '@tiptap/core'

import { type Toolbar } from '../toolbar/Toolbar'

export interface BallonnEventProps {
  toolbar: Toolbar
}

export enum BalloonPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  FLOAT = 'float'
}

export interface BalloonOptions {
  position: BalloonPosition
}

export class Balloon {
  ballonMenu!: HTMLDivElement
  ballonPanel!: HTMLDivElement
  editor: Editor
  options: BalloonOptions = {
    position: BalloonPosition.BOTTOM
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

    const arrowDirection = this.options.position == BalloonPosition.TOP ? 'balloon-arrow-down' : 'balloon-arrow-up'

    this.ballonPanel.classList.add('balloon-panel', arrowDirection)

    this.ballonMenu.append(this.ballonPanel)
  }

  getBalloon() {
    return this.ballonMenu
  }

  isOpen() {
    return !this.ballonMenu.classList.contains('ex-hidden')
  }

  setPosition(x: number, y: number) {
    //+10 is the height of the arrow
    this.ballonMenu.style.top = `${y + 10}px`
    this.ballonMenu.style.left = `${x}px`

    this.ballonMenu.classList.remove('ex-hidden')

    requestAnimationFrame(() => {
      this.ballonMenu.classList.add(`balloon-menu-${this.options.position}-center`)
      this.fixBalloonOverFlows(x)
    })
  }

  show() {
    this.ballonMenu.classList.remove('ex-hidden')

    requestAnimationFrame(() => {
      const rectBalloon = this.ballonMenu.getBoundingClientRect()
      const spanRect = (this.ballonMenu.parentElement as Element).getBoundingClientRect()

      if (spanRect.width > rectBalloon.width) {
        const { position } = this.options
        this.ballonMenu.classList.add(`balloon-menu-${position}-center`)
        this.ballonPanel.classList.add(`balloon-arrow-${position}-center`)
        return
      }

      this.fixBalloonOverFlows(spanRect.x)
    })
  }

  fixBalloonOverFlows(balloonX: number) {
    const { width } = this.ballonMenu.getBoundingClientRect()
    const { left, right } = this.editor.view.dom.getBoundingClientRect()
    const isOverflowLeft = overFlowLeft(balloonX, left, width)
    const isOverflowRight = overFlowRight(balloonX, right, width)
    const { position } = this.options
    if (isOverflowLeft && !isOverflowRight) {
      this.setBalloonMenuClass(`balloon-menu-${position}-left`, `balloon-arrow-${position}-left`)
    } else if (isOverflowRight && !isOverflowLeft) {
      this.setBalloonMenuClass(`balloon-menu-${position}-right`, `balloon-arrow-${position}-right`)
    } else {
      this.setBalloonMenuClass(`balloon-menu-${position}-center`, `balloon-arrow-${position}-center`)
    }
  }

  setBalloonMenuClass(menuClass: string, arrowClass: string) {
    const { position } = this.options
    this.ballonMenu.classList.remove(`balloon-menu-${position}-left`, `balloon-menu-${position}-right`, `balloon-menu-${position}-center`)
    this.ballonPanel.classList.remove(`balloon-arrow-${position}-left`, `balloon-arrow-${position}-right`, `balloon-arrow-${position}-center`)
    this.ballonMenu.classList.add(menuClass)
    this.ballonPanel.classList.add(arrowClass)
  }

  hide() {
    this.ballonMenu.classList.add('ex-hidden')
  }
}

function overFlowRight(balloonX: number, editorTR: number, balloonWidth: number) {
  const middle = balloonWidth / 2
  return balloonX + middle > editorTR
}

function overFlowLeft(balloonX: number, editorTl: number, balloonWidth: number) {
  const middle = balloonWidth / 2
  return balloonX - middle < editorTl
}
