import superscript from '@icons/superscript.svg'
import { Superscript as SuperscriptBase } from '@tiptap/extension-superscript'

function togglesuperscript({ editor, button }: any) {
  editor.chain().focus().toggleSuperscript().run()
  if (editor.isActive('superscript')) {
    button.on()
  } else {
    button.off()
  }
}

export const Superscript = SuperscriptBase.extend({
  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: superscript,
        events: {
          click: togglesuperscript
        },
        checkActive: this.name
      }
    }
  }
})
