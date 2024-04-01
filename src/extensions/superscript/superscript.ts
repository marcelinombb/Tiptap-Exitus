import { Superscript as SuperscriptBase } from '@tiptap/extension-superscript'

import superscript from '../../assets/icons/Editor/superscript.svg'
import { type EventProps } from '../../editor/ui'

function togglesuperscript({ editor, button }: EventProps) {
  editor.chain().focus().toggleSuperscript().run()
  if (editor.isActive('superscript')) {
    button.classList.add('ex-button-active')
  } else {
    button.classList.remove('ex-button-active')
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
