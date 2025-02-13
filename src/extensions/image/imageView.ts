import { Toolbar } from '@editor/toolbar'
import { Button, type ButtonEventProps, type Dropdown, type DropDownEventProps } from '@editor/ui'
import { Balloon, BalloonPosition } from '@editor/ui/Balloon'
import textDl from '@icons/image-left.svg'
import textDm from '@icons/image-middle.svg'
import textDr from '@icons/image-right.svg'
import imgSize from '@icons/image-size.svg'
import type ExitusEditor from '@src/ExitusEditor'
import { type Editor } from '@tiptap/core'
import { type Node as ProseMirrorNode } from '@tiptap/pm/model'
import { type Node } from '@tiptap/pm/model'
import { type NodeView } from '@tiptap/pm/view'

import { convertToBase64 } from './image'
import ResizableImage from './ResizableImage'

function imageClickHandler({ imageWrapper, balloon }: ImageView) {
  imageWrapper.addEventListener('click', event => {
    event.stopPropagation()
    imageWrapper.classList.add('ex-selected')

    if (!balloon.isOpen()) {
      balloon.show()
    }

    function clickOutside(event: Event) {
      const target = event.target as HTMLElement

      if (target.closest('.ex-image-wrapper') === null) {
        balloon.hide()
        imageWrapper.classList.remove('ex-selected')
        window.removeEventListener('mousedown', clickOutside)
      }
    }

    window.addEventListener('mousedown', clickOutside)
  })
}

function alinhaDireita(imageView: ImageView) {
  return ({ button }: ButtonEventProps) => {
    const { imageWrapper } = imageView
    if (!imageWrapper.classList.contains('ex-image-block-align-right')) {
      button.on()
      imageWrapper.classList.add('ex-image-block-align-right')
      imageWrapper.classList.remove('ex-image-block-align-center', 'ex-image-block-align-left')
    } else {
      button.off()
      imageWrapper.classList.remove('ex-image-block-align-right')
    }
    imageView.updateAttributes({
      classes: imageWrapper.className
    })
  }
}

function alinhaEsquerda(imageView: ImageView) {
  return ({ button }: ButtonEventProps) => {
    const { imageWrapper } = imageView
    if (!imageWrapper.classList.contains('ex-image-block-align-left')) {
      button.on()
      imageWrapper.classList.add('ex-image-block-align-left')
      imageWrapper.classList.remove('ex-image-block-align-center', 'ex-image-block-align-right')
    } else {
      button.off()
      imageWrapper.classList.remove('ex-image-block-align-left')
    }
    imageView.updateAttributes({
      classes: imageWrapper.className
    })
  }
}

function alinhaMeio(imageView: ImageView) {
  return ({ button }: ButtonEventProps) => {
    const { imageWrapper } = imageView
    if (!imageWrapper.classList.contains('ex-image-block-align-center')) {
      button.on()
      imageWrapper.classList.add('ex-image-block-align-center')
      imageWrapper.classList.remove('ex-image-block-align-left', 'ex-image-block-align-right')
    } else {
      button.off()
      imageWrapper.classList.remove('ex-image-block-align-center')
    }
    imageView.updateAttributes({
      classes: imageWrapper.className
    })
  }
}

function sizeButton(dropdown: Dropdown, label: string, size: number | (() => number)) {
  const button = new Button(dropdown.editor, {
    label,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    const sizeValue = typeof size == 'number' ? size : size()
    dropdown.editor.commands.setImageWidth(`${sizeValue}px`)
  })

  return button.render()
}

function criarDropDown(dropdown: Dropdown, imageView: ImageView) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = 'ex-dropdownList-content'

  const original = sizeButton(dropdown, `original`, () => {
    return imageView.originalSize
  })
  const pequeno = sizeButton(dropdown, '300px', 300)
  const medio = sizeButton(dropdown, '400px', 400)
  const grande = sizeButton(dropdown, '700px', 700)

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

export class ImageView implements NodeView {
  node: Node
  dom: Element
  image: HTMLImageElement
  imageWrapper: HTMLElement
  balloon: Balloon
  editor: Editor
  getPos: boolean | (() => number)
  resizer: ResizableImage
  originalSize: number = 300

  constructor(
    node: Node,
    editor: Editor,
    getPos: boolean | (() => number),
    public proxyUrl: string | undefined
  ) {
    this.node = node
    this.editor = editor
    this.getPos = getPos
    this.dom = document.createElement('div')
    this.imageWrapper = this.dom.appendChild(document.createElement('div'))
    this.imageWrapper.className = node.attrs.classes

    this.image = this.imageWrapper.appendChild(document.createElement('img'))
    this.setImageAttributes(this.image, node)
    this.image.setAttribute('style', 'display: table-cell')

    const imageUrlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp|svg))/i

    if (imageUrlRegex.test(node.attrs.src)) {
      this.urlToBase64(node.attrs.src)
    } else {
      this.image.onload = () => {
        this.originalSize = this.image.width
        this.image.onload = null
      }
    }

    // Adiciona redimensionamento de imagens
    this.resizer = new ResizableImage(this)

    const toolbar = new Toolbar(editor as ExitusEditor, ['alinhaEsquerda', 'alinhaMeio', 'alinhaDireita', 'tamanhoImg'])
    toolbar.setButton('alinhaDireita', {
      icon: textDr,
      click: alinhaDireita(this),
      tooltip: 'Imagem alinhada a direita'
    })
    toolbar.setButton('alinhaMeio', {
      icon: textDm,
      click: alinhaMeio(this),
      tooltip: 'Imagem centralizada'
    })
    toolbar.setButton('alinhaEsquerda', {
      icon: textDl,
      click: alinhaEsquerda(this),
      tooltip: 'Imagem alinhada a asquerda'
    })
    toolbar.setDropDown(
      'tamanhoImg',
      {
        icon: imgSize,
        click: showDropdown,
        tooltip: 'Redimensionar imagem',
        classes: []
      },
      dropdown => {
        return criarDropDown(dropdown, this)
      }
    )
    this.balloon = new Balloon(editor, {
      position: BalloonPosition.TOP
    })

    this.balloon.ballonPanel.appendChild(toolbar.render())

    this.imageWrapper.appendChild(this.balloon.getBalloon())

    imageClickHandler(this)
  }

  update(newNode: ProseMirrorNode) {
    if (newNode.type !== this.node.type) {
      return false
    }

    this.node = newNode
    this.setImageAttributes(this.image, this.node)

    return true
  }

  urlToBase64(url: string) {
    const image = new Image()
    image.src = `${this.proxyUrl}/${encodeURIComponent(url)}`
    image.setAttribute('crossorigin', 'anonymous')
    image.onload = convertToBase64(image, (base64Url, width) => {
      this.updateAttributes({ src: base64Url })
      image.onload = null
      this.originalSize = width
    })
  }

  deselectNode() {
    this.imageWrapper.classList.remove('ex-selected')
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
    ;(this.imageWrapper as HTMLElement).setAttribute('style', `${node.attrs.style}`)
    image.setAttribute('src', node.attrs.src)
  }
}
