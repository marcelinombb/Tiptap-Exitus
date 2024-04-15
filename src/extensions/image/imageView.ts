import { type Node } from '@tiptap/pm/model'
import { type NodeView } from '@tiptap/pm/view'

function clickHandler(imageWrapper: HTMLElement) {
  imageWrapper.addEventListener('click', event => {
    event.stopPropagation()
    imageWrapper.classList.add('ex-selected')
    const balloonMenu = imageWrapper.querySelector('.baloon-menu') as HTMLElement
    console.log(balloonMenu)

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

export class ImageView implements NodeView {
  node: Node
  dom: Element
  image: Element
  imageWrapper: Element

  constructor(node: Node) {
    this.node = node

    this.dom = document.createElement('div')
    this.imageWrapper = this.dom.appendChild(document.createElement('div'))
    this.imageWrapper.className = 'ex-image-wrapper ex-image-block-middle tiptap-widget'
    this.image = this.imageWrapper.appendChild(document.createElement('img'))
    this.setImageAttributes(this.image, node)
    this.imageWrapper.innerHTML += ` 
    <div class="baloon-menu" style="display: none;">
    <div class="baloon-panel">
    </div>
    <div class="baloon-arrow"></div>
  </div>`
    clickHandler(this.imageWrapper as HTMLElement)
  }

  setImageAttributes(image: Element, node: Node) {
    ;(this.imageWrapper as HTMLElement).style.width = node.attrs.width
    Object.entries(node.attrs).forEach(([key, value]) => value && image.setAttribute(key, value))
  }
}
