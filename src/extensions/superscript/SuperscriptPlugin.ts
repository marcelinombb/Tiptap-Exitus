import { Plugin } from '@editor/Plugin'
import { Button, type ButtonEventProps } from '@editor/ui/Button'
import subscript from '@icons/subscript.svg'
import Superscript from '@tiptap/extension-superscript'

export class SuperscriptPlugin extends Plugin {
  static get pluginName() {
    return 'superscript'
  }

  static get requires() {
    return [Superscript]
  }

  init(): void {
    const config = {
      icon: subscript,
      click: this.toggleSuperscript,
      checkActive: SuperscriptPlugin.pluginName,
      tooltip: 'Subscrito (Ctrl + ,)'
    }
    const button = new Button(this.editor, config)
    button.setParentToolbar(this.editor.toolbar)
    button.bind('click', config.click)
    this.editor.toolbar.setTool(SuperscriptPlugin.pluginName, button)
  }

  toggleSuperscript({ editor, button }: ButtonEventProps) {
    editor.chain().focus().toggleSuperscript().run()
    button.toggleActive(editor.isActive('superscript'))
  }
}
