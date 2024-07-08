import { Plugin } from '@editor/Plugin'
import { type ButtonEventProps } from '@editor/ui'
import goback from '@icons/arrow-go-back-line.svg'
import goforward from '@icons/arrow-go-forward-line.svg'
import { History } from '@tiptap/extension-history'

export class HistoryPlugin extends Plugin {
  static get pluginName() {
    return 'history'
  }

  static get requires() {
    return [History]
  }

  init(): void {
    this.editor.toolbar.setButton('goback', {
      icon: goback,
      click: this.goBack,
      tooltip: 'Desfazer - (Ctrl + Z)'
    })
    this.editor.toolbar.setButton('goforward', {
      icon: goforward,
      click: this.goFoward,
      tooltip: 'Refazer - (Ctrl + Y)'
    })
  }

  goBack({ editor }: ButtonEventProps) {
    editor.chain().focus().undo().run()
  }

  goFoward({ editor }: ButtonEventProps) {
    editor.chain().focus().redo().run()
  }
}
