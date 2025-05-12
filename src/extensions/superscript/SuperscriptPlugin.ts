import { Plugin } from '@editor/Plugin'
import { type ButtonEventProps } from '@editor/ui/Button'
import superscript from '@icons/superscript.svg'
import Superscript from '@tiptap/extension-superscript'

export class SuperscriptPlugin extends Plugin {
  static get pluginName() {
    return 'superscript'
  }

  static get requires() {
    return [Superscript]
  }

  init(): void {
    this.editor.toolbar.setButton('superscript', {
      icon: superscript,
      click: this.toggleSuperscript,
      checkActive: SuperscriptPlugin.pluginName,
      tooltip: 'Sobescrito (Ctrl + .)'
    })
  }

  toggleSuperscript({ editor, button }: ButtonEventProps) {
    editor.chain().focus().toggleSuperscript().run()
    button.toggleActive(editor.isActive('superscript'))
  }
}
