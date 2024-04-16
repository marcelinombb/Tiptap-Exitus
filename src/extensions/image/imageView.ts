import textDl from '@icons/text-direction-l.svg'
import textDr from '@icons/text-direction-r.svg'
import { type Editor } from '@tiptap/core'
import { type Node } from '@tiptap/pm/model'
import { type NodeView } from '@tiptap/pm/view'
import type ExitusEditor from 'src/ExitusEditor'

import Toolbar from '../../editor/toolbar/Toolbar'

function clickHandler(imageWrapper: HTMLElement) {
  imageWrapper.addEventListener('click', event => {
    event.stopPropagation()
    imageWrapper.classList.add('ex-selected')
    const balloonMenu = imageWrapper.querySelector('.baloon-menu') as HTMLElement
    console.log(balloonMenu)

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

export class ImageView implements NodeView {
  node: Node
  dom: Element
  image: Element
  imageWrapper: Element
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
    const toolbar = new Toolbar(editor as ExitusEditor, this.ballonPanel, ['btn1', 'btn2', 'btn3', 'btn4'])
    toolbar.createToolbar({
      btn1: {
        toolbarButtonConfig: {
          icon: textDr,
          events: {
            click: () => {}
          }
        }
      },
      btn2: {
        toolbarButtonConfig: {
          icon: textDl,
          events: {
            click: () => {}
          }
        }
      },
      btn3: {
        toolbarButtonConfig: {
          icon: textDl,
          events: {
            click: () => {}
          }
        }
      },
      btn4: {
        toolbarButtonConfig: {
          icon: textDl,
          events: {
            click: () => {}
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
