// @ts-nocheck
import { Bold as BoldBase } from '@tiptap/extension-bold'

import bold from '../../assets/icons/Editor/bold.svg'

function toggleBold({ editor, button }) {
  console.log(editor)
  editor.chain().focus().toggleBold().run()
  if (editor.isActive('bold')) {
    button.classList.add('ex-toolbar-button-active')
  } else {
    button.classList.remove('ex-toolbar-button-active')
  }
}

const Bold = BoldBase.extend({
  addStorage() {
    return {
      toolbarButton: {
        icon: bold,
        events: {
          click: toggleBold
        }
      }
    }
  }
})

export default Bold
