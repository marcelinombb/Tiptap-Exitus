// @ts-nocheck
import { Strike as StrikeBase } from '@tiptap/extension-strike'

import strike from '../../assets/icons/Editor/strikethrough.svg'

function toggleStrike({ editor, button }) {
  editor.chain().focus().toggleStrike().run()
  if (editor.isActive('strike')) {
    button.classList.add('ex-button-active')
  } else {
    button.classList.remove('ex-button-active')
  }
}

export const Strike = StrikeBase.extend({
  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: strike,
        events: {
          click: toggleStrike
        },
        checkActive: this.name
      }
    }
  }
})
