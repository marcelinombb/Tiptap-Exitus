import { type ImageView } from './imageView'

export default class ResizableImage {
  imageView: ImageView
  private isResizing: boolean = false
  private initialX: number = 0

  private initialWidth: number = 0

  quadradoTopEsquerda!: HTMLElement
  quadradoTopDireita!: HTMLElement
  quadradoBaixoEsquerda!: HTMLElement
  quadradoBaixoDireita!: HTMLElement
  bindResizeEvent: (event: PointerEvent) => void
  bindStopResizeEvent: () => void

  constructor(imageView: ImageView) {
    this.imageView = imageView
    this.bindResizeEvent = this.resize.bind(this)
    this.bindStopResizeEvent = this.stopResize.bind(this)
    this.initResize()
  }

  private initResize() {
    const element = this.imageView.imageWrapper
    element.style.position = 'relative'

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
  }

  private addResizeEvent(element: HTMLElement) {
    element.addEventListener('pointerdown', (event: PointerEvent) => {
      event.preventDefault()
      event.stopPropagation()
      this.isResizing = true
      this.initialX = event.screenX

      this.initialWidth = this.imageView.imageWrapper.offsetWidth
      document.addEventListener('pointermove', this.bindResizeEvent)
      document.addEventListener('pointerup', this.bindStopResizeEvent)
    })
  }

  private resize(event: PointerEvent) {
    if (!this.isResizing) return

    const deltaX = event.screenX - this.initialX

    if (this.isResizingOnLeftSide()) {
      this.imageView.imageWrapper.style.width = `${this.initialWidth - deltaX}px`
    } else {
      this.imageView.imageWrapper.style.width = `${this.initialWidth + deltaX}px`
    }
  }

  private stopResize() {
    this.isResizing = false
    document.removeEventListener('pointermove', this.bindResizeEvent)
    document.removeEventListener('pointerup', this.bindStopResizeEvent)

    const { editor, node } = this.imageView
    editor.commands.updateAttributes(node.type, {
      style: `width: ${this.imageView.imageWrapper.style.width}`
    })
  }
  private isResizingOnLeftSide(): boolean {
    const rect = this.imageView.imageWrapper.getBoundingClientRect()
    return this.initialX < rect.left + rect.width / 2
  }
}
