// @ts-nocheck
import subscript from '@icons/subscript.svg'
import { Subscript as SubscriptBase } from '@tiptap/extension-subscript'

function togglesubscript({ editor, button }) {
  editor.chain().focus().toggleSubscript().run()
  if (editor.isActive('subscript')) {
    button.on()
  } else {
    button.off()
  }
}

export const Subscript = SubscriptBase.extend({
  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: subscript,
        events: {
          click: togglesubscript
        },
        checkActive: this.name
      }
    }
  }
})
