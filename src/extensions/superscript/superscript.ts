import { Superscript as SuperscriptBase } from '@tiptap/extension-superscript'

import superscript from '../../assets/icons/Editor/superscript.svg'

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
