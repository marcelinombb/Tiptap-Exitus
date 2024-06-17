// @ts-nocheck
import underline from '@icons/underline.svg'
import { Underline as UnderlineBase } from '@tiptap/extension-underline'

function toggleUnderline({ editor, button }) {
  editor.chain().focus().toggleUnderline().run()
  if (editor.isActive('underline')) {
    button.classList.add('ex-button-active')
  } else {
    button.classList.remove('ex-button-active')
  }
}

export const Underline = UnderlineBase.extend({
  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: underline,
        click: toggleUnderline,
        checkActive: this.name,
        tooltip: 'Sublinhado (Ctrl + U)'
      }
    }
  }
})
