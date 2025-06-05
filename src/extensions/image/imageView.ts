import { Toolbar } from '@editor/toolbar'
import { Button, type ButtonEventProps, type Dropdown, type DropDownEventProps } from '@editor/ui'
import { Balloon, BalloonPosition } from '@editor/ui/Balloon'
import imgCaption from '@icons/image-caption.svg'
import imgFloatLeft from '@icons/image-float-left.svg'
import imgFloatRight from '@icons/image-float-right.svg'
import textDl from '@icons/image-left.svg'
import textDm from '@icons/image-middle.svg'
import textDr from '@icons/image-right.svg'
import imgSize from '@icons/image-size.svg'
import type ExitusEditor from '@src/ExitusEditor'
import { type Editor } from '@tiptap/core'
import { type Node as ProseMirrorNode } from '@tiptap/pm/model'
import { type Node } from '@tiptap/pm/model'
import { type NodeView, type ViewMutationRecord } from '@tiptap/pm/view'

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

function resetImageClass(imageWrapper: HTMLElement, newClass: string) {
  imageWrapper.className = ''
  imageWrapper.classList.add('ex-image-wrapper', 'tiptap-widget', newClass)
}

function alinhaDireita(imageView: ImageView) {
  return ({ button }: ButtonEventProps) => {
    const { imageWrapper } = imageView
    if (!imageWrapper.classList.contains('ex-image-block-align-right')) {
      button.on()
      resetImageClass(imageWrapper, 'ex-image-block-align-right')
    } else {
      button.off()
      resetImageClass(imageWrapper, 'ex-image-block-middle')
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
      resetImageClass(imageWrapper, 'ex-image-block-align-left')
    } else {
      button.off()
      resetImageClass(imageWrapper, 'ex-image-block-middle')
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
      resetImageClass(imageWrapper, 'ex-image-block-align-center')
    } else {
      button.off()
      imageWrapper.classList.remove('ex-image-block-align-center')
    }
    imageView.updateAttributes({
      classes: imageWrapper.className
    })
  }
}

function sizeButton(dropdown: Dropdown, imageView: ImageView, label: string, size: number | (() => number)) {
  const button = new Button(dropdown.editor, {
    label,
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    const sizeValue = typeof size == 'number' ? size : size()
    imageView.updateAttributes({
      style: `width: ${sizeValue}px;`
    })
  })

  return button.render()
}

function criarDropDown(dropdown: Dropdown, imageView: ImageView) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = 'ex-dropdownList-content'

  const original = sizeButton(dropdown, imageView, `original`, () => {
    return imageView.originalSize
  })
  const pequeno = sizeButton(dropdown, imageView, '300px', 300)
  const medio = sizeButton(dropdown, imageView, '400px', 400)
  const grande = sizeButton(dropdown, imageView, '700px', 700)

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

function criarDropDownAlinhamentoTexto(dropdown: Dropdown, imageView: ImageView) {
  const dropdownContent = document.createElement('div')
  dropdownContent.className = 'ex-dropdownList-content'

  const buttonAlignLeft = new Button(dropdown.editor, {
    icon: imgFloatLeft,
    classList: ['ex-mr-0']
  })

  const buttonAlignRight = new Button(dropdown.editor, {
    icon: imgFloatRight,
    classList: ['ex-mr-0']
  })

  buttonAlignLeft.bind('click', () => {
    const { imageWrapper } = imageView
    if (!imageWrapper.classList.contains('ex-image-float-left')) {
      buttonAlignLeft.on()
      buttonAlignRight.off()
      resetImageClass(imageWrapper, 'ex-image-float-left')
    } else {
      buttonAlignLeft.off()
      resetImageClass(imageWrapper, 'ex-image-block-middle')
    }
    imageView.updateAttributes({
      classes: imageWrapper.className
    })
  })

  buttonAlignRight.bind('click', () => {
    const { imageWrapper } = imageView
    if (!imageWrapper.classList.contains('ex-image-float-right')) {
      buttonAlignRight.on()
      buttonAlignLeft.off()
      resetImageClass(imageWrapper, 'ex-image-float-right')
    } else {
      buttonAlignRight.off()
      resetImageClass(imageWrapper, 'ex-image-block-middle')
    }
    imageView.updateAttributes({
      classes: imageWrapper.className
    })
  })

  dropdownContent?.append(buttonAlignLeft.render(), buttonAlignRight.render())

  return dropdownContent
}

function showDropdownAlinnhamentoTexto({ event, dropdown }: DropDownEventProps) {
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
  contentDOM?: HTMLElement | null | undefined
  image: HTMLImageElement
  imageWrapper: HTMLElement
  figcaption: HTMLElement
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

    this.imageWrapper = document.createElement('figure')
    this.imageWrapper.draggable = true
    this.imageWrapper.className = node.attrs.classes

    this.image = this.imageWrapper.appendChild(document.createElement('img'))
    this.setImageAttributes(this.image, node)
    this.image.contentEditable = 'false'
    this.image.draggable = false
    this.image.setAttribute('style', 'display: table-cell')

    this.figcaption = this.imageWrapper.appendChild(document.createElement('figcaption'))
    this.figcaption.dataset['placeholder'] = 'Legenda da imagem'
    const figcaptionText = node.content.size === 0
    if (figcaptionText) {
      this.figcaption.className = 'ex-hidden'
    }

    this.contentDOM = this.figcaption

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

    const toolbar = this.setupToolbar()

    this.balloon = new Balloon(this.editor, {
      position: BalloonPosition.TOP
    })

    this.balloon.ballonPanel.appendChild(toolbar.render())

    this.imageWrapper.appendChild(this.balloon.getBalloon())

    imageClickHandler(this)

    this.dom = this.imageWrapper
  }

  toggleFigcation(button: Button) {
    const figcaption = this.figcaption
    if (figcaption) {
      if (figcaption.classList.contains('ex-hidden')) {
        figcaption.classList.remove('ex-hidden')
        this.figcaption.classList.add('figcaption-is-empty')
        button.on()
      } else {
        figcaption.classList.add('ex-hidden')
        figcaption.textContent = ''
        button.off()
      }
    }
  }

  update(newNode: ProseMirrorNode) {
    if (newNode.type !== this.node.type) {
      return false
    }

    this.figcaption.classList.toggle('figcaption-is-empty', newNode.content.size === 0)

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

  ignoreMutation(mutation: ViewMutationRecord) {
    if (mutation.type === 'attributes') {
      return true
    }
    return false
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

  setupToolbar() {
    const toolbar = new Toolbar(this.editor as ExitusEditor, [
      'adicionarLegenda',
      'alinhaEsquerda',
      'alinhaMeio',
      'alinhaDireita',
      'tamanhoImg',
      'alinhamentoTexto'
    ])
    toolbar.setButton('adicionarLegenda', {
      icon: imgCaption,
      click: ({ button }) => {
        this.toggleFigcation(button)
      },
      tooltip: 'Habilitar legenda'
    })
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
    toolbar.setDropDown(
      'alinhamentoTexto',
      {
        icon: imgFloatLeft,
        click: showDropdownAlinnhamentoTexto,
        tooltip: 'Alinhar imagem ao texto',
        classes: []
      },
      dropdown => {
        return criarDropDownAlinhamentoTexto(dropdown, this)
      }
    )

    return toolbar
  }
}
