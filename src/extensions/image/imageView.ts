import textDm from '@icons/align-vertically.svg'
import textDl from '@icons/text-direction-l.svg'
import textDr from '@icons/text-direction-r.svg'
import { type Editor } from '@tiptap/core'
import { type Node } from '@tiptap/pm/model'
import { type NodeView } from '@tiptap/pm/view'
import type ExitusEditor from 'src/ExitusEditor'

import Toolbar from '../../editor/toolbar/Toolbar'
import { Button, type ButtonEventProps } from '../../editor/ui'

function clickHandler(imageWrapper: HTMLElement) {
  imageWrapper.addEventListener('click', event => {
    event.stopPropagation()
    imageWrapper.classList.add('ex-selected')
    const balloonMenu = imageWrapper.querySelector('.baloon-menu') as HTMLElement

    if (balloonMenu) {
      if (balloonMenu.style.display === 'none') {
        balloonMenu.style.display = 'block'
      }
    }
    window.addEventListener('click', function (event) {
      const target = event.target as HTMLElement

      if (!target.matches('.ex-image-wrapper')) {
        balloonMenu.style.display = 'none'
        imageWrapper.classList.remove('ex-selected')
      }
    })
  })
}

function alinhaDireita(image: HTMLElement, toolbar: Toolbar) {
  return ({ button }: ButtonEventProps) => {
    if (!image.classList.contains('ex-direita')) {
      toolbar.tools.forEach(tool => tool instanceof Button && tool.off())
      button.on()
      image.classList.add('ex-direita')
      image.classList.remove('ex-meio', 'ex-esquerda')
    } else {
      button.off()
      image.classList.remove('ex-direita')
    }
  }
}
function alinhaEsquerda(image: HTMLElement, toolbar: Toolbar) {
  return ({ button }: ButtonEventProps) => {
    if (!image.classList.contains('ex-esquerda')) {
      toolbar.tools.forEach(tool => tool instanceof Button && tool.off())
      button.on()
      image.classList.add('ex-esquerda')
      image.classList.remove('ex-meio', 'ex-direita')
    } else {
      button.off()
      image.classList.remove('ex-esquerda')
    }
  }
}

function alinhaMeio(image: HTMLElement, toolbar: Toolbar) {
  return ({ button }: ButtonEventProps) => {
    if (!image.classList.contains('ex-meio')) {
      toolbar.tools.forEach(tool => tool instanceof Button && tool.off())
      button.on()
      image.classList.add('ex-meio')
      image.classList.remove('ex-esquerda', 'ex-direita')
    } else {
      button.off()
      image.classList.remove('ex-meio')
    }
  }
}

export class ImageView implements NodeView {
  node: Node
  dom: Element
  image: HTMLElement
  imageWrapper: HTMLElement
  ballonMenu: HTMLElement
  ballonPanel: HTMLDivElement
  ballonArrow: HTMLElement

  constructor(node: Node, editor: Editor) {
    this.node = node

    this.dom = document.createElement('div')
    this.imageWrapper = this.dom.appendChild(document.createElement('div'))
    this.imageWrapper.className = 'ex-image-wrapper ex-image-block-middle tiptap-widget'
    this.image = this.imageWrapper.appendChild(document.createElement('img'))
    this.setImageAttributes(this.image, node)

    this.ballonMenu = document.createElement('div')
    this.ballonMenu.className = 'baloon-menu'
    this.ballonMenu.style.display = 'none'

    this.ballonPanel = this.ballonMenu.appendChild(document.createElement('div'))
    this.ballonPanel.className = 'baloon-panel ex-toolbar-editor'
    const toolbar = new Toolbar(editor as ExitusEditor, this.ballonPanel, ['alinhaEsquerda', 'alinhaDireita', 'alinhaMeio'])
    toolbar.createToolbar({
      alinhaDireita: {
        toolbarButtonConfig: {
          icon: textDr,
          label: 'direita',
          events: {
            click: alinhaDireita(this.imageWrapper, toolbar)
          }
        }
      },
      alinhaEsquerda: {
        toolbarButtonConfig: {
          icon: textDl,
          label: 'esquerda',
          events: {
            click: alinhaEsquerda(this.imageWrapper, toolbar)
          }
        }
      },
      alinhaMeio: {
        toolbarButtonConfig: {
          icon: textDm,
          label: 'meio',
          events: {
            click: alinhaMeio(this.imageWrapper, toolbar)
          }
        }
      }
    })

    this.ballonArrow = this.ballonMenu.appendChild(document.createElement('div'))
    this.ballonArrow.className = 'baloon-arrow'

    this.ballonMenu.append(this.ballonPanel, this.ballonArrow)

    this.imageWrapper.appendChild(this.ballonMenu)

    clickHandler(this.imageWrapper as HTMLElement)
  }

  setImageAttributes(image: Element, node: Node) {
    ;(this.imageWrapper as HTMLElement).style.width = node.attrs.width
    Object.entries(node.attrs).forEach(([key, value]) => value && image.setAttribute(key, value))
  }
}
