import { Plugin } from '@editor/Plugin'
import { type ButtonEventProps } from '@editor/ui'
import quote from '@icons/double-quotes-l.svg'
import { Blockquote } from '@tiptap/extension-blockquote'
import './style.css'

export class BlockquotePlugin extends Plugin {
  static get pluginName() {
    return 'blockquote'
  }

  static get requires() {
    return [Blockquote]
  }

  init(): void {
    this.editor.toolbar.setButton('blockquote', {
      icon: quote,
      click: this.toggleBlockQuote,
      checkActive: 'blockquote',
      tooltip: 'Bloco de citação'
    })
  }

  toggleBlockQuote({ editor, button }: ButtonEventProps) {
    editor.chain().focus().toggleBlockquote().run()
    if (editor.isActive('blockquote')) {
      button.on()
    } else {
      button.off()
    }
  }
}
