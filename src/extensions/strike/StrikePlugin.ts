import { Plugin } from '@editor/Plugin'
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
    this.editor.toolbar.setButton('strike', {
      icon: strike,
      click: this.toggleStrike,
      checkActive: StrikePlugin.pluginName,
      tooltip: 'Tachado (Ctrl + Shift + S)'
    })
  }

  toggleStrike({ editor, button }: ButtonEventProps) {
    editor.chain().focus().toggleStrike().run()
    button.toggleActive(editor.isActive('strike'))
  }
}
