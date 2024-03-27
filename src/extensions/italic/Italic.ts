// @ts-nocheck
import { Italic as ItalicBase } from '@tiptap/extension-italic'

import italic from '../../assets/icons/Editor/italic.svg'

function toggleItalic({ editor }) {
  editor.chain().focus().toggleItalic().run()
}

const Italic = ItalicBase.extend({
  addStorage() {
    return {
      toolbarButton: {
        icon: italic,
        events: {
          click: toggleItalic
        }
      }
    }
  }
})

export default Italic
