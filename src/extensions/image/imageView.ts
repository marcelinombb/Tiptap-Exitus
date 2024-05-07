import { Toolbar } from '@editor/toolbar'
import { Button, type ButtonEventProps, Dropdown, type DropDownEventProps } from '@editor/ui'
import { Balloon } from '@editor/ui/Balloon'
import arrowDropDown from '@icons/arrow-drop-down-line.svg'
import textDl from '@icons/image-left.svg'
import textDm from '@icons/image-middle.svg'
import textDr from '@icons/image-right.svg'
import imgSize from '@icons/image-size.svg'
import { type Editor } from '@tiptap/core'
import { type Node } from '@tiptap/pm/model'
import { type NodeView } from '@tiptap/pm/view'
import type ExitusEditor from 'src/ExitusEditor'

class ResizableImage {
  //private element: HTMLElement
  imageView: ImageView
  private _isResizing: boolean = false
  private initialX: number = 0
  // private initialY: number = 0
  private initialWidth: number = 0
  // private initialHeight: number = 0
  quadradoTopEsquerda!: HTMLElement
  quadradoTopDireita!: HTMLElement
  quadradoBaixoEsquerda!: HTMLElement
  quadradoBaixoDireita!: HTMLElement
  bindResizeEvent: (event: PointerEvent) => void
  bindStopResizeEvent: () => void
  resizers!: HTMLDivElement

  constructor(imageView: ImageView) {
    this.imageView = imageView
    this.bindResizeEvent = this.resize.bind(this)
    this.bindStopResizeEvent = this.stopResize.bind(this)
    this.initResize()
  }

  private initResize() {
    const element = document.createElement('div')
    element.className = 'ex-hidden'

    // Quadrado no canto superior esquerdo
    this.quadradoTopEsquerda = element.appendChild(document.createElement('div'))
    this.quadradoTopEsquerda.className = 'quadrado canto-superior-esquerdo'
    this.addResizeEvent(this.quadradoTopEsquerda)
    // Quadrado no canto superior direito
    this.quadradoTopDireita = element.appendChild(document.createElement('div'))
    this.quadradoTopDireita.className = 'quadrado canto-superior-direito'
    this.addResizeEvent(this.quadradoTopDireita)
    // Quadrado no canto inferior esquerdo
    this.quadradoBaixoEsquerda = element.appendChild(document.createElement('div'))
    this.quadradoBaixoEsquerda.className = 'quadrado canto-inferior-esquerdo'
    this.addResizeEvent(this.quadradoBaixoEsquerda)
    // Quadrado no canto inferior direito
    this.quadradoBaixoDireita = element.appendChild(document.createElement('div'))
    this.quadradoBaixoDireita.className = 'quadrado canto-inferior-direito'
    this.addResizeEvent(this.quadradoBaixoDireita)

    this.resizers = element

    this.imageView.imageWrapper.appendChild(element)
  }

  private addResizeEvent(element: HTMLElement) {
    element.addEventListener('pointerdown', (event: PointerEvent) => {
      event.preventDefault()
      event.stopPropagation()
      this._isResizing = true
      this.initialX = event.screenX
      this.initialWidth = this.imageView.imageWrapper.offsetWidth
      document.addEventListener('pointermove', this.bindResizeEvent)
      document.addEventListener('pointerup', this.bindStopResizeEvent)
    })
  }

  get isResizing() {
    return this._isResizing
  }

  private resize(event: PointerEvent) {
    if (!this._isResizing) return

    const deltaX = event.screenX - this.initialX

    this.imageView.imageWrapper.style.width = `${this.initialWidth + deltaX}px`
  }

  private stopResize() {
    this._isResizing = false
    document.removeEventListener('pointermove', this.bindResizeEvent)
    document.removeEventListener('pointerup', this.bindStopResizeEvent)

    this.imageView.updateAttributes({
      style: `width: ${this.imageView.imageWrapper.style.width}`
    })
  }
}

function imageClickHandler({ imageWrapper, balloon, resizer }: ImageView) {
  imageWrapper.addEventListener('click', event => {
    event.stopPropagation()
    imageWrapper.classList.add('ex-selected')
    const resizers = resizer.resizers

    if (!balloon.isOpen()) {
      balloon.show()
      resizers.classList.remove('ex-hidden')
    }

    function clickOutside(event: Event) {
      const target = event.target as HTMLElement

      if (!target.matches('.ex-image-wrapper')) {
        balloon.hide()
        imageWrapper.classList.remove('ex-selected')
        resizers.classList.add('ex-hidden')
        window.removeEventListener('click', clickOutside)
      }
    }

    window.addEventListener('click', clickOutside)
  })
}

function alinhaDireita(imageView: ImageView) {
  return ({ button }: ButtonEventProps) => {
    const { imageWrapper } = imageView
    if (!imageWrapper.classList.contains('ex-direita')) {
      button.parentToolbar.tools.forEach(tool => tool instanceof Button && tool.off())
      button.on()
      imageWrapper.classList.add('ex-direita')
      imageWrapper.classList.remove('ex-meio', 'ex-esquerda')
    } else {
      button.off()
      imageWrapper.classList.remove('ex-direita')
    }
    imageView.updateAttributes({
      classes: imageWrapper.className
    })
  }
}

function alinhaEsquerda(imageView: ImageView) {
  return ({ button }: ButtonEventProps) => {
    const { imageWrapper } = imageView
    if (!imageWrapper.classList.contains('ex-esquerda')) {
      button.parentToolbar.tools.forEach(tool => tool instanceof Button && tool.off())
      button.on()
      imageWrapper.classList.add('ex-esquerda')
      imageWrapper.classList.remove('ex-meio', 'ex-direita')
    } else {
      button.off()
      imageWrapper.classList.remove('ex-esquerda')
    }
    imageView.updateAttributes({
      classes: imageWrapper.className
    })
  }
}

function alinhaMeio(imageView: ImageView) {
  return ({ button }: ButtonEventProps) => {
    const { imageWrapper } = imageView
    if (!imageWrapper.classList.contains('ex-meio')) {
      button.parentToolbar.tools.forEach(tool => tool instanceof Button && tool.off())
      button.on()
      imageWrapper.classList.add('ex-meio')
      imageWrapper.classList.remove('ex-esquerda', 'ex-direita')
    } else {
      button.off()
      imageWrapper.classList.remove('ex-meio')
    }
    imageView.updateAttributes({
      classes: imageWrapper.className
    })
  }
}

function originalPx(dropdown: Dropdown, icon: string) {
  const button = new Button(dropdown.editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    /* if (!image.classList.contains('')) {
      //dropdown.parentToolbar.tools.forEach(tool => tool instanceof Button && tool.off())
      button.on()
      image.classList.remove('ex-grande', 'ex-pequeno', 'ex-medio')
    } else {
      button.off()
      image.classList.remove('ex-grande', 'ex-pequeno', 'ex-medio')
      dropdown.off()
    } */
  })

  return button.render()
}

function trezentosPx(dropdown: Dropdown, icon: string) {
  const button = new Button(dropdown.editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    dropdown.editor.commands.setImageWidth('300px')
    /* if (imageWrapper.style.width != '300px') {
      imageWrapper.style.width = '300px'
      button.on()
    } else {
      button.off()
      imageWrapper.style.width = ''
      dropdown.off()
    } */
  })

  return button.render()
}

function quatrocentosPx(dropdown: Dropdown, icon: string) {
  const button = new Button(dropdown.editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    dropdown.editor.commands.setImageWidth('400px')
    /* if (imageWrapper.style.width != '400px') {
      imageWrapper.style.width = '400px'
      button.on()
    } else {
      button.off()
      imageWrapper.style.width = ''
      dropdown.off()
    } */
  })

  return button.render()
}

function setecentosPx(dropdown: Dropdown, icon: string) {
  const button = new Button(dropdown.editor, {
    icon: icon,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    dropdown.editor.commands.setImageWidth('700px')
    /* if (imageWrapper.style.width != '700px') {
      //dropdown.parentToolbar.tools.forEach(tool => tool instanceof Button && tool.off())
      imageWrapper.style.width = '700px'
    } else {
      button.off()
      imageWrapper.style.width = ''
      dropdown.off()
    } */
  })

  return button.render()
}

function criarDropDown(dropdown: Dropdown) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = '.ex-dropdownList-content'

  const original = originalPx(dropdown, 'Original')
  const pequeno = trezentosPx(dropdown, '300px')
  const medio = quatrocentosPx(dropdown, '400px')
  const grande = setecentosPx(dropdown, '700px')

  dropdownContent?.append(original, pequeno, medio, grande)

  return dropdownContent
}

function showDropdown({ event, dropdown }: DropDownEventProps) {
  event.stopPropagation()
  if (dropdown.isOpen) {
    dropdown.off()
  } else {
    dropdown.on()
  }
}

function balloonDropDown() {
  return ({ editor }: any) => {
    const dropdown = new Dropdown(editor, {
      events: {
        open: showDropdown
      },
      classes: ['ex-dropdown-listItem']
    })

    dropdown.setDropDownContent(criarDropDown(dropdown))

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
  editor: Editor
  getPos: boolean | (() => number)
  resizer: ResizableImage

  constructor(node: Node, editor: Editor, getPos: boolean | (() => number)) {
    this.node = node
    this.editor = editor
    this.getPos = getPos
    this.dom = document.createElement('div')
    this.imageWrapper = this.dom.appendChild(document.createElement('div'))
    this.imageWrapper.className = node.attrs.classes

    this.image = this.imageWrapper.appendChild(document.createElement('img'))

    this.setImageAttributes(this.image, node)

    // Adiciona redimensionamento de imagens
    this.resizer = new ResizableImage(this)

    const configStorage = {
      alinhaDireita: {
        toolbarButtonConfig: {
          icon: textDr,
          label: 'direita',
          events: {
            click: alinhaDireita(this)
          }
        }
      },
      alinhaMeio: {
        toolbarButtonConfig: {
          icon: textDm,
          label: 'meio',
          events: {
            click: alinhaMeio(this)
          }
        }
      },
      alinhaEsquerda: {
        toolbarButtonConfig: {
          icon: textDl,
          label: 'esquerda',
          events: {
            click: alinhaEsquerda(this)
          }
        }
      },
      tamanhoImg: {
        toolbarButtonConfig: {
          icon: imgSize + arrowDropDown,
          label: 'Aumenta e diminui',
          dropdown: balloonDropDown()
        }
      }
    }

    const toolbar = new Toolbar(editor as ExitusEditor, {
      toolbarOrder: ['alinhaEsquerda', 'alinhaMeio', 'alinhaDireita', 'tamanhoImg'],
      configStorage
    })

    this.balloon = new Balloon(editor)
    this.balloon.ballonPanel.appendChild(toolbar.createToolbar())

    this.imageWrapper.appendChild(this.balloon.getBalloon())

    imageClickHandler(this)
  }

  updateAttributes(attributes: Record<string, any>) {
    if (typeof this.getPos === 'function') {
      const { view } = this.editor
      const transaction = view.state.tr
      transaction.setNodeMarkup(this.getPos(), undefined, {
        ...this.node.attrs,
        ...attributes
      })
      view.dispatch(transaction)
    }
  }

  setImageAttributes(image: Element, node: Node) {
    ;(this.imageWrapper as HTMLElement).setAttribute('style', node.attrs.style)
    image.setAttribute('src', node.attrs.src)
  }
}
