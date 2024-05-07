import imageAdd from '@icons/image-add-fill.svg'
import { type CommandProps } from '@tiptap/core'
import { Image as ImageBase } from '@tiptap/extension-image'
import { findSelectedNodeOfType } from 'prosemirror-utils'

import { type ButtonEventProps } from '../../editor/ui'
import type ExitusEditor from '../../ExitusEditor'

import { ImageView } from './imageView'

const inputID = 'editorImagePicker'

function convertToBase64(input: HTMLInputElement, editor: ExitusEditor) {
  if (input.files && input.files[0]) {
    const reader = new FileReader()

    reader.onload = function (e) {
      const img = document.createElement('img') as HTMLImageElement
      img.onload = function () {
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
        ctx?.drawImage(img, 0, 0)

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)

        editor
          .chain()
          .focus()
          .setImage({ src: dataUrl as string })
          .run()
      }

      img.src = e.target?.result as string
    }

    reader.readAsDataURL(input.files[0])
  }
}

function createFileInput(editor: ExitusEditor) {
  const inputElement = document.createElement('input')
  inputElement.setAttribute('type', 'file')
  inputElement.className = 'ex-hidden'
  inputElement.setAttribute('id', inputID + editor.editorInstance)
  inputElement.setAttribute('accept', 'image/jpeg,image/png,image/gif,image/bmp,image/webp,image/tiff')
  inputElement.addEventListener('change', function () {
    convertToBase64(this, editor)
  })

  return inputElement
}

function addImage({ editor }: ButtonEventProps) {
  const inputElement = createFileInput(editor) as HTMLInputElement
  inputElement.click()
}

export const Image = ImageBase.extend({
  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: imageAdd,
        events: {
          click: addImage
        },
        checkActive: this.name
      }
    }
  },

  renderHTML({ HTMLAttributes }) {
    const { style, classes, src } = HTMLAttributes

    return ['div', { style, class: classes }, ['img', { src }]]
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      selectedClass: {
        default: ''
      },
      classes: {
        default: 'ex-image-wrapper ex-image-block-middle tiptap-widget'
      },
      style: {
        default: '',
        parseHTML: element => {
          const parent = element!.parentNode as HTMLElement
          if (parent.classList.contains('ex-image-wrapper') || parent.tagName.toLocaleLowerCase() == 'figure') {
            return `width: ${parent.style.width}`
          } else {
            return null
          }
        }
      }
    }
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setImageWidth: (width: string) => {
        return ({ tr, state, dispatch }: CommandProps) => {
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
  addNodeView() {
    return ({ node, editor, getPos }) => {
      return new ImageView(node, editor, getPos)
    }
  }
})
