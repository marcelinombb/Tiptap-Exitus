// @ts-nocheck
import underline from '@icons/underline.svg'
import { Underline as UnderlineBase } from '@tiptap/extension-underline'

function toggleUnderline({ editor, button }) {
  editor.chain().focus().toggleUnderline().run()
  button.toggleActive(editor.isActive('underline'))
}

export const Underline = UnderlineBase.extend({
  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: underline,
        click: toggleUnderline,
        checkActive: this.name
      }
    }
  }
})
