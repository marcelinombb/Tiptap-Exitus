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

class CustomSizeManager {
  private static STORAGE_KEY = 'ex-image-custom-size'

  static getSavedSize(): { width: number; height: number; label: string } | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }

  static saveSize(width: number, height: number, label?: string): void {
    const newSize = {
      width,
      height,
      label: label || `${width}x${height}px`
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newSize))
  }

  static clearSavedSize(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}

// Dropdown para tamanho personalizado
class CustomSizeDropdown {
  private dropdown: HTMLElement
  private widthInput: HTMLInputElement
  private heightInput: HTMLInputElement
  private onConfirm: (width: number, height: number) => void

  constructor(onConfirm: (width: number, height: number) => void) {
    this.onConfirm = onConfirm
    this.dropdown = this.createDropdown()
    this.widthInput = this.dropdown.querySelector('#ex-width-input') as HTMLInputElement
    this.heightInput = this.dropdown.querySelector('#ex-height-input') as HTMLInputElement
  }

  private createDropdown(): HTMLElement {
    const dropdown = document.createElement('div')
    dropdown.className = 'ex-dropdownList-content ex-custom-size-dropdown'
    dropdown.innerHTML = `
      <div class="ex-custom-size-form">
        <div class="ex-input-group">
          <label for="ex-width-input">Largura (px)</label>
          <input type="number" id="ex-width-input" min="50" max="1000" placeholder="400">
        </div>
        <div class="ex-input-group">
          <label for="ex-height-input">Altura (px)</label>
          <input type="number" id="ex-height-input" min="50" max="1000" placeholder="300">
        </div>
        ${this.createSavedSizeSection()}
        <div class="ex-custom-size-buttons">
          <button class="ex-apply-size">Aplicar</button>
        </div>
      </div>
    `

    this.setupEventListeners(dropdown)
    return dropdown
  }

  private createSavedSizeSection(): string {
    const savedSize = CustomSizeManager.getSavedSize()
    if (!savedSize) return ''

    return `
      <div class="ex-custom-size-separator"></div>
      <div class="ex-saved-size">
        <button class="ex-saved-size-button" data-width="${savedSize.width}" data-height="${savedSize.height}">
          ${savedSize.label}
        </button>
      </div>
    `
  }

  private setupEventListeners(dropdown: HTMLElement): void {
    const applyBtn = dropdown.querySelector('.ex-apply-size') as HTMLButtonElement
    applyBtn.addEventListener('click', () => this.handleApply())

    const savedBtn = dropdown.querySelector('.ex-saved-size-button') as HTMLButtonElement
    if (savedBtn) {
      savedBtn.addEventListener('click', () => {
        const width = parseInt(savedBtn.dataset.width || '0')
        const height = parseInt(savedBtn.dataset.height || '0')
        this.onConfirm(width, height)
      })
    }

    dropdown.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        this.handleApply()
      }
    })
  }

  private handleApply(): void {
    const width = parseInt(this.widthInput.value)
    const height = parseInt(this.heightInput.value)

    if (width > 0 && height > 0) {
      CustomSizeManager.saveSize(width, height)
      this.onConfirm(width, height)
    }
  }

  getElement(): HTMLElement {
    return this.dropdown
  }
}

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
    if (!imageWrapper.classList.contains('ex-image-block-middle')) {
      button.on()
      resetImageClass(imageWrapper, 'ex-image-block-middle')
    } else {
      button.off()
      imageWrapper.classList.remove('ex-image-block-middle')
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

function customSizeButton(dropdown: Dropdown, imageView: ImageView) {
  const button = new Button(dropdown.editor, {
    label: 'Personalizado',
    classList: ['ex-mr-0']
  })

  button.bind('click', () => {
    dropdown.off()

    const customDropdown = new CustomSizeDropdown((width, height) => {
      if (typeof imageView.getPos === 'function') {
        const pos = imageView.getPos()
        const { view } = imageView.editor
        const doc = view.state.doc

        if (pos >= 0 && pos < doc.content.size) {
          imageView.updateAttributes({
            style: `width: ${width}px; height: ${height}px;`
          })
        }
      }

      if (document.body.contains(dropdownElement)) {
        document.body.removeChild(dropdownElement)
      }
    })

    const dropdownElement = customDropdown.getElement()

    const balloonElement = imageView.balloon.getBalloon()
    if (balloonElement) {
      const rect = balloonElement.getBoundingClientRect()
      dropdownElement.style.position = 'absolute'
      dropdownElement.style.left = `${rect.left}px`
      dropdownElement.style.top = `${rect.bottom + 5}px`
      dropdownElement.style.zIndex = '1001'
    }

    document.body.appendChild(dropdownElement)

    const firstInput = dropdownElement.querySelector('input') as HTMLInputElement
    if (firstInput) {
      firstInput.focus()
    }

    const handleClickOutside = (e: Event) => {
      const target = e.target as HTMLElement
      if (!dropdownElement.contains(target)) {
        if (document.body.contains(dropdownElement)) {
          document.body.removeChild(dropdownElement)
        }
        document.removeEventListener('click', handleClickOutside)
      }
    }

    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 100)
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
  const personalizado = customSizeButton(dropdown, imageView)

  const buttons = [original, pequeno, medio, grande, personalizado]

  dropdownContent?.append(...buttons)

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
        const naturalWidth = this.image.naturalWidth
        this.originalSize = naturalWidth

        if (!node.attrs.style || !node.attrs.style.includes('width')) {
          const defaultWidth = Math.min(naturalWidth, 400)
          this.updateAttributes({
            style: `width: ${defaultWidth}px;`
          })
        }

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
      this.originalSize = width

      const attributes: Record<string, any> = { src: base64Url }
      if (!this.node.attrs.style || !this.node.attrs.style.includes('width')) {
        const defaultWidth = Math.min(width, 400)
        attributes.style = `width: ${defaultWidth}px;`
      }

      this.updateAttributes(attributes)
      image.onload = null
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
      tooltip: 'Imagem alinhada à direita'
    })
    toolbar.setButton('alinhaMeio', {
      icon: textDm,
      click: alinhaMeio(this),
      tooltip: 'Imagem centralizada'
    })
    toolbar.setButton('alinhaEsquerda', {
      icon: textDl,
      click: alinhaEsquerda(this),
      tooltip: 'Imagem alinhada à asquerda'
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
