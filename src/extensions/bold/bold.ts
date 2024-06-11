import { type ButtonEventProps } from '@editor/ui'
import bold from '@icons/bold.svg'
import { Bold as BoldBase } from '@tiptap/extension-bold'

function toggleBold({ editor, button }: ButtonEventProps) {
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
        click: toggleBold,
        checkActive: this.name
      }
    }
  }
})
