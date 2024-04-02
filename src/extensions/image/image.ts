import { Image as ImageBase } from '@tiptap/extension-image'

import imageAdd from '../../assets/icons/Editor/image-add-fill.svg'
import { type EventProps } from '../../editor/ui'
import type ExitusEditor from '../../ExitusEditor'

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

function addImage({ editor }: EventProps) {
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
  addNodeView() {
    return ({ node }) => {
      const container = document.createElement('div')

      const content = document.createElement('div')
      content.className = 'ex-image ex-image-block-middle tiptap-widget'

      content.addEventListener('click', event => {
        //console.log(node.attrs)

        //event.currentTarget.classList.add('ex-selected')
        console.log(event.currentTarget)
      })

      const image = document.createElement('img')
      //image.setAttribute
      Object.entries(node.attrs).forEach(([key, value]) => {
        if (value == null) return
        image.setAttribute(key, value)
      })

      content.append(image)
      container.append(content)

      return {
        dom: container,
        contentDOM: content
      }
    }
  }
})
