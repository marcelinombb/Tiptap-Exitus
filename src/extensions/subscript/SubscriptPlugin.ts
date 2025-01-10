import { Plugin } from '@editor/Plugin'
import { type ButtonEventProps } from '@editor/ui'
import subscript from '@icons/subscript.svg'
import Subscript from '@tiptap/extension-subscript'

export class SubscriptPlugin extends Plugin {
  static get pluginName() {
    return 'subscript'
  }

  static get requires() {
    return [Subscript]
  }

  init(): void {
    this.editor.toolbar.setButton('subscript', {
      icon: subscript,
      click: this.togglesubscript,
      checkActive: SubscriptPlugin.pluginName,
      tooltip: 'Subscrito (Ctrl + ,)'
    })
  }

  togglesubscript({ editor, button }: ButtonEventProps) {
    editor.chain().focus().toggleSubscript().run()
    button.toggleActive(editor.isActive('subscript'))
  }
}
