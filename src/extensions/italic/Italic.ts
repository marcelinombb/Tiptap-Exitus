// @ts-nocheck
import { Italic as ItalicBase } from '@tiptap/extension-italic'

import italic from '../../assets/icons/Editor/italic.svg'

function toggleItalic({ editor, button }) {
  editor.chain().focus().toggleItalic().run()
  if (editor.isActive('italic')) {
    button.classList.add('ex-button-active')
  } else {
    button.classList.remove('ex-button-active')
  }
}

export const Italic = ItalicBase.extend({
  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: italic,
        events: {
          click: toggleItalic
        },
        checkActive: this.name
      }
    }
  }
})
