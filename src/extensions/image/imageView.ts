import arrowDropDown from '@icons/arrow-drop-down-line.svg'
import textDl from '@icons/image-left.svg'
import textDm from '@icons/image-middle.svg'
import textDr from '@icons/image-rigth.svg'
import imgSize from '@icons/image-size.svg'
import { type Editor } from '@tiptap/core'
import { type Node } from '@tiptap/pm/model'
import { type NodeView } from '@tiptap/pm/view'

import { Button, type ButtonEventProps, Dropdown } from '../../editor/ui'
import { type BallonnEventProps, Balloon } from '../../editor/ui/Balloon'

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

function alinhaDireita(image: HTMLElement) {
  return (ballonConfig: BallonnEventProps) => {
    return ({ button }: ButtonEventProps) => {
      if (!image.classList.contains('ex-direita')) {
        ballonConfig.toolbar.tools.forEach(tool => tool instanceof Button && tool.off())
        button.on()
        image.classList.add('ex-direita')
        image.classList.remove('ex-meio', 'ex-esquerda')
      } else {
        button.off()
        image.classList.remove('ex-direita')
      }
    }
  }
}
function alinhaEsquerda(image: HTMLElement) {
  return (ballonConfig: BallonnEventProps) => {
    return ({ button }: ButtonEventProps) => {
      if (!image.classList.contains('ex-esquerda')) {
        ballonConfig.toolbar.tools.forEach(tool => tool instanceof Button && tool.off())
        button.on()
        image.classList.add('ex-esquerda')
        image.classList.remove('ex-meio', 'ex-direita')
      } else {
        button.off()
        image.classList.remove('ex-esquerda')
      }
    }
  }
}

function alinhaMeio(image: HTMLElement) {
  return (ballonConfig: BallonnEventProps) => {
    return ({ button }: ButtonEventProps) => {
      if (!image.classList.contains('ex-meio')) {
        ballonConfig.toolbar.tools.forEach(tool => tool instanceof Button && tool.off())
        button.on()
        image.classList.add('ex-meio')
        image.classList.remove('ex-esquerda', 'ex-direita')
      } else {
        button.off()
        image.classList.remove('ex-meio')
      }
    }
  }
}

function aumentaDiminui(image: HTMLElement) {
  return (ballonConfig: BallonnEventProps) => {
    return ({ button }: ButtonEventProps) => {
      if (!image.classList.contains('ex-grande')) {
        ballonConfig.toolbar.tools.forEach(tool => tool instanceof Button && tool.off())
        button.on()
        image.classList.add('ex-grande')
        image.classList.remove('ex-pequeno')
      } else {
        button.off()
        image.classList.remove('ex-grande')
      }
    }
  }
}

export class ImageView implements NodeView {
  node: Node
  dom: Element
  image: HTMLElement
  imageWrapper: HTMLElement
  balloon: Balloon

  constructor(node: Node, editor: Editor) {
    this.node = node

    this.dom = document.createElement('div')
    this.imageWrapper = this.dom.appendChild(document.createElement('div'))
    this.imageWrapper.className = 'ex-image-wrapper ex-image-block-middle tiptap-widget'
    this.image = this.imageWrapper.appendChild(document.createElement('img'))
    this.setImageAttributes(this.image, node)

    const configStorage = {
      alinhaDireita: {
        toolbarButtonConfig: {
          icon: textDr,
          label: 'direita',
          events: {
            click: alinhaDireita(this.imageWrapper)
          }
        }
      },
      alinhaMeio: {
        toolbarButtonConfig: {
          icon: textDm,
          label: 'meio',
          events: {
            click: alinhaMeio(this.imageWrapper)
          }
        }
      },
      alinhaEsquerda: {
        toolbarButtonConfig: {
          icon: textDl,
          label: 'esquerda',
          events: {
            click: alinhaEsquerda(this.imageWrapper)
          }
        }
      },
      tamanhoImg: {
        toolbarButtonConfig: {
          icon: imgSize + arrowDropDown,
          label: 'Aumenta e diminui',
          events: {
            click: aumentaDiminui(this.imageWrapper)
          }
        }
      }
    }

    this.balloon = new Balloon(editor, {
      toolbarOrder: ['alinhaEsquerda', 'alinhaMeio', 'alinhaDireita', 'tamanhoImg'],
      configStorage
    })

    this.imageWrapper.appendChild(this.balloon.render())

    clickHandler(this.imageWrapper as HTMLElement)
  }

  setImageAttributes(image: Element, node: Node) {
    ;(this.imageWrapper as HTMLElement).style.width = node.attrs.width
    Object.entries(node.attrs).forEach(([key, value]) => value && image.setAttribute(key, value))
  }
}
