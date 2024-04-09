import imageAdd from '@icons/image-add-fill.svg'
import { Image as ImageBase } from '@tiptap/extension-image'

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
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

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

  document.body.appendChild(inputElement)
  return inputElement
}

function addImage({ editor }: ButtonEventProps) {
  const inputElement = (document.querySelector(`#${inputID + editor.editorInstance}`) || createFileInput(editor)) as HTMLInputElement
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
  addAttributes() {
    return {
      ...this.parent?.(),
      selectedClass: {
        default: ''
      },
      width: {
        default: null,
        parseHTML: element => {
          if ((element!.parentNode as HTMLElement).tagName.toUpperCase() !== 'FIGURE') return null
          return (element!.parentNode as HTMLElement).style.width
        }
      }
    }
  },
  addNodeView() {
    return ({ node }) => {
      return new ImageView(node)
    }
  }
})
