import { type ButtonEventProps } from '@editor/ui/Button'
import subscript from '@icons/subscript.svg'
import { Subscript as SubscriptBase } from '@tiptap/extension-subscript'

function togglesubscript({ editor, button }: ButtonEventProps) {
  editor.chain().focus().toggleSubscript().run()
  button.toggleActive(editor.isActive('subscript'))
}

export const Subscript = SubscriptBase.extend({
  addStorage() {
    return {
      toolbarButtonConfig: {
        icon: subscript,
        click: togglesubscript,
        checkActive: this.name,
        tooltip: 'Subscrito (Ctrl + ,)'
      }
    }
  }
})
