import { Plugin } from '@editor/Plugin'
import { type ButtonEventProps } from '@editor/ui'
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
    this.editor.toolbar.setButton(UnderlinePlugin.pluginName, {
      icon: underline,
      click: this.toggleUnderline,
      checkActive: UnderlinePlugin.pluginName,
      tooltip: 'Sublinhado (Ctrl + U)'
    })
  }

  toggleUnderline({ editor, button }: ButtonEventProps) {
    editor.chain().focus().toggleUnderline().run()
    button.toggleActive(editor.isActive('underline'))
  }
}
