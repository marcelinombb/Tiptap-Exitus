import { Plugin } from '@editor/Plugin'
import { Button, type ButtonEventProps } from '@editor/ui'
import underline from '@icons/underline.svg'
import { Underline } from '@tiptap/extension-underline'

export class UnderlinePlugin extends Plugin {
  static get pluginName() {
    return 'underline'
  }

  static get requires() {
    return [Underline]
  }

  init(): void {
    const config = {
      icon: underline,
      click: this.toggleUnderline,
      checkActive: UnderlinePlugin.pluginName,
      tooltip: 'Sublinhado (Ctrl + U)'
    }
    const button = new Button(this.editor, config)
    button.setParentToolbar(this.editor.toolbar)
    button.bind('click', config.click)
    this.editor.toolbar.setTool(UnderlinePlugin.pluginName, button)
  }

  toggleUnderline({ editor, button }: ButtonEventProps) {
    editor.chain().focus().toggleUnderline().run()
    button.toggleActive(editor.isActive('underline'))
  }
}
