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

  constructor(imageView: ImageView) {
    this.imageView = imageView
    this.handleResizeEvent = this.resize.bind(this)
    this.handleStopResizeEvent = this.stopResize.bind(this)
    this.initializeResizers()
  }

  private initializeResizers() {
    const resizerContainer = document.createElement('div')
    resizerContainer.className = 'resizers-container'
    resizerContainer.contentEditable = 'false'
    this.topLeftResizer = this.createResizer(resizerContainer, 'top-left')
    this.topRightResizer = this.createResizer(resizerContainer, 'top-right')
    this.bottomLeftResizer = this.createResizer(resizerContainer, 'bottom-left')
    this.bottomRightResizer = this.createResizer(resizerContainer, 'bottom-right')

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

    document.addEventListener('pointermove', this.handleResizeEvent)
    document.addEventListener('pointerup', this.handleStopResizeEvent)
  }

  private resize(event: PointerEvent) {
    if (!this._isResizing) return

    const deltaX = event.screenX - this.initialX
    const isLeftResize = this.isLeftSideResize()

    const newWidth = isLeftResize ? this.initialWidth - deltaX : this.initialWidth + deltaX

    this.imageView.imageWrapper.style.width = `${Math.min(newWidth, 700)}px`
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

    this.imageView.updateAttributes({
      style: `width: ${this.imageView.imageWrapper.style.width}`
    })
  }

  private isLeftSideResize(): boolean {
    const rect = this.imageView.imageWrapper.getBoundingClientRect()
    return this.initialX < rect.left + rect.width / 2
  }

  get isResizing() {
    return this._isResizing
  }
}
