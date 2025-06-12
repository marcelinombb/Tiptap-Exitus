import { type ImageView } from './imageView'

export default class ResizableImage {
  imageView: ImageView
  private _isResizing: boolean = false
  private initialX: number = 0
  private initialWidth: number = 0
  private resizers!: HTMLDivElement

  topLeftResizer!: HTMLElement
  topRightResizer!: HTMLElement
  bottomLeftResizer!: HTMLElement
  bottomRightResizer!: HTMLElement

  private handleResizeEvent: (event: PointerEvent) => void
  private handleStopResizeEvent: () => void

  private label: HTMLDivElement | null = null

  constructor(imageView: ImageView) {
    this.imageView = imageView
    this.handleResizeEvent = this.resize.bind(this)
    this.handleStopResizeEvent = this.stopResize.bind(this)
    this.initializeResizers()
  }

  private initializeResizers() {
    const resizerContainer = document.createElement('div')
    resizerContainer.className = 'resizers-container'
    this.topLeftResizer = this.createResizer(resizerContainer, 'top-left')
    this.topRightResizer = this.createResizer(resizerContainer, 'top-right')
    this.bottomLeftResizer = this.createResizer(resizerContainer, 'bottom-left')
    this.bottomRightResizer = this.createResizer(resizerContainer, 'bottom-right')

    this.label = document.createElement('div')
    this.label.className = 'resize-label ex-hidden'
    this.label.style.position = 'absolute'
    this.label.style.top = '8px'
    this.label.style.right = '8px'
    this.label.style.background = 'rgba(0,0,0,0.7)'
    this.label.style.color = '#fff'
    this.label.style.padding = '2px 8px'
    this.label.style.borderRadius = '4px'
    this.label.style.fontSize = '12px'
    this.label.style.zIndex = '10'
    this.imageView.imageWrapper.appendChild(this.label)

    this.resizers = resizerContainer
    this.imageView.imageWrapper.appendChild(resizerContainer)
  }

  private createResizer(container: HTMLElement, position: string): HTMLElement {
    const resizer = document.createElement('div')
    resizer.className = `resizer ${position}`
    resizer.addEventListener('pointerdown', this.startResize.bind(this))
    container.appendChild(resizer)
    return resizer
  }

  private startResize(event: PointerEvent) {
    event.preventDefault()
    this._isResizing = true
    this.initialX = event.screenX
    this.initialWidth = this.imageView.imageWrapper.offsetWidth

    // Mostra a label
    this.updateLabel()
    this.showLabel()

    document.addEventListener('pointermove', this.handleResizeEvent)
    document.addEventListener('pointerup', this.handleStopResizeEvent)
  }

  private resize(event: PointerEvent) {
    if (!this._isResizing) return

    const deltaX = event.screenX - this.initialX
    const isLeftResize = this.isLeftSideResize()

    const newWidth = Math.min(isLeftResize ? this.initialWidth - deltaX : this.initialWidth + deltaX, 700)
    this.imageView.imageWrapper.style.width = `${newWidth}px`
    this.updateLabel()
  }

  public show() {
    this.resizers.classList.remove('ex-hidden')
  }

  public hide() {
    this.resizers.classList.add('ex-hidden')
  }

  private stopResize() {
    this._isResizing = false
    document.removeEventListener('pointermove', this.handleResizeEvent)
    document.removeEventListener('pointerup', this.handleStopResizeEvent)

    this.hideLabel()

    this.imageView.updateAttributes({
      style: `width: ${this.imageView.imageWrapper.style.width}`
    })
  }

  private isLeftSideResize(): boolean {
    const rect = this.imageView.imageWrapper.getBoundingClientRect()
    return this.initialX < rect.left + rect.width / 2
  }

  private updateLabel() {
    if (!this.label) return
    const width = this.imageView.imageWrapper.offsetWidth
    const img = this.imageView.image
    // Calcula altura mantendo proporção
    const naturalWidth = img.naturalWidth || width
    const naturalHeight = img.naturalHeight || 1
    const height = Math.round((width / naturalWidth) * naturalHeight)
    this.label.textContent = `${width} x ${height}`
  }

  private showLabel() {
    if (this.label) this.label.classList.remove('ex-hidden')
  }

  private hideLabel() {
    if (this.label) this.label.classList.add('ex-hidden')
  }

  get isResizing() {
    return this._isResizing
  }
}
