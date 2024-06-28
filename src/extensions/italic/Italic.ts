// @ts-nocheck
import italic from '@icons/italic.svg'
import { Italic as ItalicBase } from '@tiptap/extension-italic'

function toggleItalic({ editor, button }) {
  editor.chain().focus().toggleItalic().run()
  button.toggleActive(editor.isActive('italic'))
}

export const Italic = ItalicBase.extend({
  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: italic,
        click: toggleItalic,
        checkActive: this.name,
        tooltip: 'Itálico (Ctrl + I)'
      }
    }
  }
})
