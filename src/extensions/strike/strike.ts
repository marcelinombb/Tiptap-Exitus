import strike from '@icons/strikethrough.svg'
import { Strike as StrikeBase } from '@tiptap/extension-strike'

function toggleStrike({ editor, button }: any) {
  editor.chain().focus().toggleStrike().run()
  if (editor.isActive('strike')) {
    button.on()
  } else {
    button.off()
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
