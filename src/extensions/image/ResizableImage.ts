import { type ImageView } from './imageView'

export type ResizeDirection = 'top' | 'right' | 'bottom' | 'left' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

export interface ResizableImageOptions {
  directions?: ResizeDirection[]
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  preserveAspectRatio?: boolean
}

export default class ResizableImage {
  imageView: ImageView
  private _isResizing: boolean = false
  private initialX: number = 0
  private initialY: number = 0
  private initialWidth: number = 0
  private initialHeight: number = 0
  private currentDirection: ResizeDirection | null = null
  private resizeContainer!: HTMLDivElement
  private aspectRatio: number = 1

  private options: Required<ResizableImageOptions> = {
    directions: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
    minWidth: 50,
    minHeight: 50,
    maxWidth: 700,
    maxHeight: 700,
    preserveAspectRatio: true
  }

  private handleResizeEvent: (event: PointerEvent) => void
  private handleStopResizeEvent: () => void

  constructor(imageView: ImageView, options?: Partial<ResizableImageOptions>) {
    this.imageView = imageView
    if (options) {
      this.options = { ...this.options, ...options }
    }
    this.handleResizeEvent = this.resize.bind(this)
    this.handleStopResizeEvent = this.stopResize.bind(this)
    this.initializeResizers()
  }

  private initializeResizers() {
    const container = document.createElement('div')
    container.className = 'resize-container'
    container.contentEditable = 'false'
    container.setAttribute('data-resize-container', 'true')

    this.options.directions.forEach(direction => {
      const handle = this.createResizeHandle(direction)
      container.appendChild(handle)
    })

    this.resizeContainer = container
    this.imageView.imageWrapper.appendChild(container)
  }

  private createResizeHandle(direction: ResizeDirection): HTMLElement {
    const handle = document.createElement('div')
    handle.className = `resize-handle resize-handle-${direction}`
    handle.setAttribute('data-resize-handle', direction)
    handle.setAttribute('data-direction', direction)
    handle.addEventListener('pointerdown', e => this.startResize(e, direction))
    return handle
  }

  private startResize(event: PointerEvent, direction: ResizeDirection) {
    event.preventDefault()
    event.stopPropagation()

    this._isResizing = true
    this.currentDirection = direction
    this.initialX = event.clientX
    this.initialY = event.clientY
    this.initialWidth = this.imageView.imageWrapper.offsetWidth
    this.initialHeight = this.imageView.imageWrapper.offsetHeight

    // Calcula a proporção da imagem
    this.aspectRatio = this.imageView.image.naturalWidth / this.imageView.image.naturalHeight

    // Adiciona classe de resize ativo
    this.imageView.imageWrapper.classList.add('is-resizing')
    this.imageView.imageWrapper.setAttribute('data-resize-state', 'active')

    document.addEventListener('pointermove', this.handleResizeEvent)
    document.addEventListener('pointerup', this.handleStopResizeEvent)
  }

  private resize(event: PointerEvent) {
    if (!this._isResizing || !this.currentDirection) return

    const deltaX = event.clientX - this.initialX
    const deltaY = event.clientY - this.initialY

    let newWidth = this.initialWidth
    let newHeight = this.initialHeight

    // Calcula novas dimensões baseado na direção
    switch (this.currentDirection) {
      case 'right':
      case 'topRight':
      case 'bottomRight':
        newWidth = this.initialWidth + deltaX
        break
      case 'left':
      case 'topLeft':
      case 'bottomLeft':
        newWidth = this.initialWidth - deltaX
        break
    }

    switch (this.currentDirection) {
      case 'bottom':
      case 'bottomLeft':
      case 'bottomRight':
        newHeight = this.initialHeight + deltaY
        break
      case 'top':
      case 'topLeft':
      case 'topRight':
        newHeight = this.initialHeight - deltaY
        break
    }

    // Preserva proporção se configurado
    if (this.options.preserveAspectRatio) {
      // Usa a maior mudança como referência
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        newHeight = newWidth / this.aspectRatio
      } else {
        newWidth = newHeight * this.aspectRatio
      }
    }

    // Aplica restrições de tamanho
    newWidth = Math.max(this.options.minWidth, Math.min(newWidth, this.options.maxWidth))
    newHeight = Math.max(this.options.minHeight, Math.min(newHeight, this.options.maxHeight))

    // Reaplica proporção após restrições se necessário
    if (this.options.preserveAspectRatio) {
      newHeight = newWidth / this.aspectRatio
    }

    // Atualiza visualmente
    this.imageView.imageWrapper.style.width = `${newWidth}px`
  }

  public show() {
    this.resizeContainer.classList.remove('ex-hidden')
    if (this.imageView.imageWrapper.classList.contains('ex-selected')) {
      this.resizeContainer.style.display = 'block'
    } else {
      this.resizeContainer.style.display = ''
    }
  }

  public hide() {
    this.resizeContainer.classList.add('ex-hidden')
    this.resizeContainer.style.display = 'none'
  }

  private stopResize() {
    if (!this._isResizing) return

    this._isResizing = false
    this.currentDirection = null

    // Remove classe de resize ativo
    this.imageView.imageWrapper.classList.remove('is-resizing')
    this.imageView.imageWrapper.removeAttribute('data-resize-state')

    document.removeEventListener('pointermove', this.handleResizeEvent)
    document.removeEventListener('pointerup', this.handleStopResizeEvent)

    // Persiste as mudanças
    this.imageView.updateAttributes({
      style: `width: ${this.imageView.imageWrapper.style.width}`
    })
  }

  get isResizing() {
    return this._isResizing
  }

  public destroy() {
    if (this._isResizing) {
      this.stopResize()
    }
    this.resizeContainer.remove()
  }
}
