import { Plugin } from '@editor/Plugin'
import { Button } from '@editor/ui'
import { type ButtonEventProps } from '@editor/ui/Button'
import strike from '@icons/strikethrough.svg'
import { Strike } from '@tiptap/extension-strike'

export class StrikePlugin extends Plugin {
  static get requires() {
    return [Strike]
  }

  static get pluginName() {
    return 'strike'
  }

  init() {
    const config = {
      icon: strike,
      click: this.toggleStrike,
      checkActive: StrikePlugin.pluginName,
      tooltip: 'Itálico (Ctrl + I)'
    }
    const button = new Button(this.editor, config)
    button.setParentToolbar(this.editor.toolbar)
    button.bind('click', config.click)
    this.editor.toolbar.setTool(StrikePlugin.pluginName, button)
  }

  toggleStrike({ editor, button }: ButtonEventProps) {
    editor.chain().focus().toggleStrike().run()
    button.toggleActive(editor.isActive('strike'))
  }
}
