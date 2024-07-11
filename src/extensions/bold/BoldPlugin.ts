import { Plugin } from '@editor/Plugin'
import { type ButtonEventProps } from '@editor/ui'
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
    this.editor.toolbar.setButton('bold', {
      icon: bold,
      click: this.toggleBold,
      checkActive: BoldPlugin.pluginName,
      tooltip: 'Negrito (Ctrl + B)'
    })
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
