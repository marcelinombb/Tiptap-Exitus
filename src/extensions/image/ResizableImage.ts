import { type ImageView } from './imageView'

export default class ResizableImage {
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
    //element.className = 'ex-hidden'

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

    if (this.isResizingOnLeftSide()) {
      this.imageView.imageWrapper.style.width = `${this.initialWidth - deltaX}px`
    } else {
      this.imageView.imageWrapper.style.width = `${this.initialWidth + deltaX}px`
    }
  }

  private stopResize() {
    this._isResizing = false
    document.removeEventListener('pointermove', this.bindResizeEvent)
    document.removeEventListener('pointerup', this.bindStopResizeEvent)

    this.imageView.updateAttributes({
      style: `width: ${this.imageView.imageWrapper.style.width}`
    })
  }

  private isResizingOnLeftSide(): boolean {
    const rect = this.imageView.imageWrapper.getBoundingClientRect()
    return this.initialX < rect.left + rect.width / 2
  }
}
