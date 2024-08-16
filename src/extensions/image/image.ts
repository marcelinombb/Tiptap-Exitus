import { type Editor, Node, nodeInputRule } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { findSelectedNodeOfType } from 'prosemirror-utils'

import { ImageView } from './imageView'

export function convertToBase64(img: HTMLImageElement, callback: (base64Url: string, width: number) => void) {
  return function () {
    const maxHeight = img.height > 700 ? 700 : img.height
    const maxWidth = img.width > 700 ? 700 : img.width
    //let newHeight, newWidth;
    const newDimension =
      img.width > img.height
        ? { width: maxWidth, height: Math.round(maxWidth / (img.width / img.height)) }
        : { width: maxHeight * (img.width / img.height), height: maxHeight }

    const canvas = document.createElement('canvas')

    canvas.width = newDimension.width
    canvas.height = newDimension.height

    const ctx = canvas.getContext('2d')
    ctx!.fillStyle = '#FFFFFF'
    ctx?.fillRect(0, 0, canvas.width, canvas.height)
    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
    callback(dataUrl, canvas.width)
  }
}

export function parseImagesToBase64(img: File, editor: Editor) {
  if (img) {
    const reader = new FileReader()

    reader.onload = function (e) {
      const img = document.createElement('img') as HTMLImageElement
      img.onload = convertToBase64(img, (base64Url: string) => {
        editor
          .chain()
          .focus()
          .setImage({ src: base64Url as string })
          .run()
      })

      img.src = e.target?.result as string
    }

    reader.readAsDataURL(img)
  }
}

export interface ImageOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, any>
  proxyUrl: string | undefined
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      /**
       * Add an image
       */
      setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType
      setImageWidth: (width: string) => ReturnType
    }
  }
}

export const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/

export const Image = Node.create<ImageOptions>({
  name: 'image',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
      proxyUrl: undefined
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null
      },
      alt: {
        default: null
      },
      title: {
        default: null
      },
      classes: {
        default: 'ex-image-wrapper ex-image-block-middle tiptap-widget'
      },
      style: {
        default: '',
        parseHTML: element => {
          const parent = element!.parentNode as HTMLElement
          if (
            ['ex-image-wrapper', 'image', 'image-inline'].some(className => parent.classList.contains(className)) ||
            parent.tagName.toLocaleLowerCase() == 'figure'
          ) {
            return `width: ${parent.style.width}`
          } else if (element.style.width !== '') {
            return `width: ${element.style.width}`
          } else {
            return null
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64 ? 'img[src]' : 'img[src]:not([src^="data:"])',
        getAttrs: node => {
          const parent = node.parentElement as HTMLElement
          const imageUrlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp|svg))/i
          const isBase64Url = /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(node.getAttribute('src') as string)
          const isUrlImage = imageUrlRegex.test(node.getAttribute('src') as string)
          return (
            (parent.classList.contains('ex-image-wrapper') || parent.tagName.toLocaleLowerCase() == 'figure' || isUrlImage || isBase64Url) && null
          )
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { style, classes, src } = HTMLAttributes

    return ['div', { style, class: classes }, ['img', { src }]]
  },

  addCommands() {
    return {
      setImage:
        options =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options
          })
        },
      setImageWidth: (width: string) => {
        return ({ tr, state, dispatch }) => {
          // Get the selection
          const { selection } = state
          // Find the table node around the selection
          let nodePos = null
          const imageNode = findSelectedNodeOfType(state.schema.nodes.image)(selection)

          if (imageNode) {
            nodePos = imageNode.pos
          }

          // If no table was found or position is undefined, abort the command
          if (!nodePos) return false

          // Ensure we have a valid width to set
          if (!width || typeof width !== 'string') return false

          // Create a new attributes object with the updated width
          const attrs = { ...imageNode?.node.attrs, style: `width: ${width}` }

          // Create a transaction that sets the new attributes
          if (dispatch) {
            tr.setNodeMarkup(nodePos, undefined, attrs)
            dispatch(tr)
          }
          return true
        }
      }
    }
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: match => {
          const [, , alt, src, title] = match
          return { src, alt, title }
        }
      })
    ]
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      return new ImageView(node, editor, getPos, this.options.proxyUrl)
    }
  },
  addProseMirrorPlugins() {
    const self = this
    return [
      new Plugin({
        key: new PluginKey('eventHandler'),
        props: {
          handleDOMEvents: {
            drop: (_view, event) => {
              const hasFiles = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length

              if (hasFiles) {
                const images = Array.from(event.dataTransfer?.files ?? []).filter(file => /image/i.test(file.type))

                if (images.length === 0) {
                  return false
                }
                images.forEach(image => parseImagesToBase64(image, self.editor))

                event.preventDefault()
                return true
              }
              return false
            }
          }
        }
      })
    ]
  }
})
