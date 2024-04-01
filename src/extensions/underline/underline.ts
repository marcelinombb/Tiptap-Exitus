// @ts-nocheck
import { Underline as UnderlineBase } from '@tiptap/extension-underline'

import underline from '../../assets/icons/Editor/underline.svg'

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
        events: {
          click: toggleUnderline
        },
        checkActive: this.name
      }
    }
  }
})
