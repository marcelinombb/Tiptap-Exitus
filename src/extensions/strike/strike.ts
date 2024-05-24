import { type ButtonEventProps } from '@editor/ui/Button'
import strike from '@icons/strikethrough.svg'
import { Strike as StrikeBase } from '@tiptap/extension-strike'

function toggleStrike({ editor, button }: ButtonEventProps) {
  editor.chain().focus().toggleStrike().run()
  button.toggleActive(editor.isActive('strike'))
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
