// @ts-nocheck
import { Bold as BoldBase } from '@tiptap/extension-bold'

import bold from '../../assets/icons/Editor/bold.svg'

function toggleBold({ editor, button }) {
  editor.chain().focus().toggleBold().run()
  if (editor.isActive('bold')) {
    button.classList.add('ex-button-active')
  } else {
    button.classList.remove('ex-button-active')
  }
}

export const Bold = BoldBase.extend({
  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: bold,
        events: {
          click: toggleBold
        },
        checkActive: this.name
      }
    }
  }
})
