import { Plugin } from '@editor/Plugin'
import { Button, type ButtonEventProps } from '@editor/ui'
import bold from '@icons/bold.svg'
import { type AnyExtension } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'

export class BoldPlugin extends Plugin {
  static get requires(): AnyExtension[] {
    return [Bold]
  }

  static get pluginName(): string {
    return 'bold'
  }

  init() {
    const config = {
      icon: bold,
      click: this.toggleBold,
      checkActive: BoldPlugin.pluginName,
      tooltip: 'Negrito (Ctrl + B)'
    }
    const button = new Button(this.editor, config)
    button.setParentToolbar(this.editor.toolbar)
    button.bind('click', config.click)
    this.editor.toolbar.setTool('bold', button)
  }

  toggleBold({ editor, button }: ButtonEventProps) {
    editor.chain().focus().toggleBold().run()
    if (editor.isActive('bold')) {
      button.on()
    } else {
      button.off()
    }
  }
}
