import { type Node } from '@tiptap/pm/model'
import { type NodeView } from '@tiptap/pm/view'

export function clickHandler(imageWrapper: HTMLElement) {
  imageWrapper.addEventListener('click', event => {
    event.stopPropagation()
    imageWrapper.classList.add('ex-selected')

    window.addEventListener('click', function (event) {
      const target = event.target as HTMLElement

      if (!target.matches('.ex-image-wrapper')) {
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
    this.setImageAttibutes(this.image, node)
    clickHandler(this.imageWrapper as HTMLElement)
  }

  setImageAttibutes(image: Element, node: Node) {
    ;(this.imageWrapper as HTMLElement).style.width = node.attrs.width
    Object.entries(node.attrs).forEach(([key, value]) => value && image.setAttribute(key, value))
  }
}
