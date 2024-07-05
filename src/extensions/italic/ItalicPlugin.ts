import { Plugin } from '@editor/Plugin'
import { Button, type ButtonEventProps } from '@editor/ui'
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
    const config = {
      icon: italic,
      click: this.toggleItalic,
      checkActive: ItalicPlugin.pluginName,
      tooltip: 'Itálico (Ctrl + I)'
    }
    const button = new Button(this.editor, config)
    button.setParentToolbar(this.editor.toolbar)
    button.bind('click', config.click)
    this.editor.toolbar.setTool(ItalicPlugin.pluginName, button)
  }

  toggleItalic({ editor, button }: ButtonEventProps) {
    editor.chain().focus().toggleItalic().run()
    button.toggleActive(editor.isActive('italic'))
  }
}
