import { Plugin } from '@editor/Plugin'
import { Button, type ButtonEventProps } from '@editor/ui'
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
    const config = {
      icon: subscript,
      click: this.togglesubscript,
      checkActive: SubscriptPlugin.pluginName,
      tooltip: 'Subscrito (Ctrl + ,)'
    }
    const button = new Button(this.editor, config)
    button.setParentToolbar(this.editor.toolbar)
    button.bind('click', config.click)
    this.editor.toolbar.setTool(SubscriptPlugin.pluginName, button)
  }

  togglesubscript({ editor, button }: ButtonEventProps) {
    editor.chain().focus().toggleSubscript().run()
    button.toggleActive(editor.isActive('subscript'))
  }
}
