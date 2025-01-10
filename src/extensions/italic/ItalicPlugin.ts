import { Plugin } from '@editor/Plugin'
import { type ButtonEventProps } from '@editor/ui'
import italic from '@icons/italic.svg'
import { type AnyExtension } from '@tiptap/core'
import { Italic } from '@tiptap/extension-italic'

export class ItalicPlugin extends Plugin {
  static get pluginName() {
    return 'italic'
  }

  static get requires(): AnyExtension[] {
    return [Italic]
  }

  init() {
    this.editor.toolbar.setButton('italic', {
      icon: italic,
      click: this.toggleItalic,
      checkActive: ItalicPlugin.pluginName,
      tooltip: 'Itálico (Ctrl + I)'
    })
  }

  toggleItalic({ editor, button }: ButtonEventProps) {
    editor.chain().focus().toggleItalic().run()
    button.toggleActive(editor.isActive('italic'))
  }
}
