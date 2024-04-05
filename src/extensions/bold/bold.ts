// @ts-nocheck
import { Bold as BoldBase } from '@tiptap/extension-bold'

import bold from '../../assets/icons/Editor/bold.svg'

function toggleBold({ editor, button }) {
  editor.chain().focus().toggleBold().run()
  if (editor.isActive('bold')) {
    button.on()
  } else {
    button.off()
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
