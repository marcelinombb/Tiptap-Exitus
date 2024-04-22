import { Toolbar } from '@editor/toolbar'
import arrowDropDown from '@icons/arrow-drop-down-line.svg'
import textDl from '@icons/image-left.svg'
import textDm from '@icons/image-middle.svg'
import textDr from '@icons/image-rigth.svg'
import imgSize from '@icons/image-size.svg'
import { type Editor } from '@tiptap/core'
import { type Node } from '@tiptap/pm/model'
import { type NodeView } from '@tiptap/pm/view'
import type ExitusEditor from 'src/ExitusEditor'

import { Button, type ButtonEventProps, Dropdown } from '../../editor/ui'
import { Balloon } from '../../editor/ui/Balloon'

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
  return ({ button }: ButtonEventProps) => {
    if (!image.classList.contains('ex-direita')) {
      button.parentToolbar.tools.forEach(tool => tool instanceof Button && tool.off())
      button.on()
      image.classList.add('ex-direita')
      image.classList.remove('ex-meio', 'ex-esquerda')
    } else {
      button.off()
      image.classList.remove('ex-direita')
    }
  }
}

function alinhaEsquerda(image: HTMLElement) {
  return ({ button }: ButtonEventProps) => {
    if (!image.classList.contains('ex-esquerda')) {
      button.parentToolbar.tools.forEach(tool => tool instanceof Button && tool.off())
      button.on()
      image.classList.add('ex-esquerda')
      image.classList.remove('ex-meio', 'ex-direita')
    } else {
      button.off()
      image.classList.remove('ex-esquerda')
    }
  }
}

function alinhaMeio(image: HTMLElement) {
  return ({ button }: ButtonEventProps) => {
    if (!image.classList.contains('ex-meio')) {
      button.parentToolbar.tools.forEach(tool => tool instanceof Button && tool.off())
      button.on()
      image.classList.add('ex-meio')
      image.classList.remove('ex-esquerda', 'ex-direita')
    } else {
      button.off()
      image.classList.remove('ex-meio')
    }
  }
}

let botaoAtivo: Button | null = null

function ativaBotao(button: Button) {
  if (botaoAtivo) {
    botaoAtivo.off()
  }
  button.on()
  botaoAtivo = button
}

function originalPx(image: HTMLElement, editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    if (!image.classList.contains('')) {
      dropdown.parentToolbar.tools.forEach(tool => tool instanceof Button && tool.off())
      ativaBotao(button)
      image.classList.remove('ex-grande', 'ex-pequeno', 'ex-medio')
    } else {
      button.off()
      image.classList.remove('ex-grande', 'ex-pequeno', 'ex-medio')
      dropdown.off()
    }
  })

  return button.render()
}

function trezentosPx(image: HTMLElement, editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    if (!image.classList.contains('ex-pequeno')) {
      dropdown.parentToolbar.tools.forEach(tool => tool instanceof Button && tool.off())
      ativaBotao(button)
      image.classList.add('ex-pequeno')
      image.classList.remove('ex-grande')
    } else {
      button.off()
      image.classList.remove('ex-pequeno')
      dropdown.off()
    }
  })

  return button.render()
}

function quatrocentosPx(image: HTMLElement, editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    if (!image.classList.contains('ex-medio')) {
      dropdown.parentToolbar.tools.forEach(tool => tool instanceof Button && tool.off())
      ativaBotao(button)
      image.classList.add('ex-medio')
      image.classList.remove('ex-grande', 'ex-pequeno')
    } else {
      button.off()
      image.classList.remove('ex-medio')
      dropdown.off()
    }
  })

  return button.render()
}

function setecentosPx(image: HTMLElement, editor: ExitusEditor, dropdown: Dropdown, icon: string) {
  const button = new Button(editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    if (!image.classList.contains('ex-grande')) {
      dropdown.parentToolbar.tools.forEach(tool => tool instanceof Button && tool.off())
      ativaBotao(button)
      image.classList.add('ex-grande')
      image.classList.remove('ex-pequeno')
    } else {
      button.off()
      image.classList.remove('ex-grande')
      dropdown.off()
    }
  })

  return button.render()
}

function criarDropDown(editor: ExitusEditor, dropdown: Dropdown, image: HTMLElement) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = '.ex-dropdownList-content'

  const original = originalPx(image, editor, dropdown, 'Original')
  const pequeno = trezentosPx(image, editor, dropdown, '300px')
  const medio = quatrocentosPx(image, editor, dropdown, '400px')
  const grande = setecentosPx(image, editor, dropdown, '700px')

  dropdownContent?.append(original, pequeno, medio, grande)

  return dropdownContent
}

function showDropdown({ event, dropdown }: any) {
  event.stopPropagation()
  if (dropdown.isOpen) {
    dropdown.off()
  } else {
    dropdown.on()
  }
}

function balloonDropDown(image: HTMLElement) {
  return ({ editor }: any) => {
    const dropdown = new Dropdown(editor, {
      events: {
        open: showDropdown
      },
      classes: ['ex-dropdown-listItem']
    })

    dropdown.setDropDownContent(criarDropDown(editor, dropdown, image))

    window.addEventListener('click', function (event: Event) {
      const target = event.target as HTMLElement
      if (!target.matches('.dropdown')) {
        dropdown.off()
      }
    })

    return dropdown
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

          dropdown: balloonDropDown(this.imageWrapper)
        }
      }
    }

    const toolbar = new Toolbar(editor as ExitusEditor, {
      toolbarOrder: ['alinhaEsquerda', 'alinhaMeio', 'alinhaDireita', 'tamanhoImg'],
      configStorage
    })

    this.balloon = new Balloon(editor, toolbar)

    this.imageWrapper.appendChild(this.balloon.render())

    clickHandler(this.imageWrapper as HTMLElement)
  }

  setImageAttributes(image: Element, node: Node) {
    ;(this.imageWrapper as HTMLElement).style.width = node.attrs.width
    Object.entries(node.attrs).forEach(([key, value]) => value && image.setAttribute(key, value))
  }
}
