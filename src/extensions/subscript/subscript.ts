// @ts-nocheck
import { Subscript as SubscriptBase } from '@tiptap/extension-subscript'

import subscript from '../../assets/icons/Editor/subscript.svg'

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
