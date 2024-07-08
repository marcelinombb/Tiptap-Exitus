import { Plugin } from '@editor/Plugin'
import { type ButtonEventProps } from '@editor/ui'
import tiraEspaço from '@icons/indent-decrease.svg'
import botaEspaco from '@icons/indent-increase.svg'

import { Indent } from './indent'

export class IndentPlugin extends Plugin {
  static get pluginName() {
    return 'indent'
  }

  static get requires() {
    return [Indent]
  }

  init() {
    this.editor.toolbar.setButton('rmRecuo', {
      icon: tiraEspaço,
      click: this.delTab,
      checkActive: 'indent',
      tooltip: 'Diminuir recuo'
    })
    this.editor.toolbar.setButton('addRecuo', {
      icon: botaEspaco,
      click: this.setTab,
      checkActive: 'indent',
      tooltip: 'Aumentar recuo'
    })
  }

  setTab({ editor, button }: ButtonEventProps) {
    editor.commands.indent()
    button.toggleActive(editor.isActive('indent'))
  }

  delTab({ editor, button }: ButtonEventProps) {
    editor.commands.outdent()
    button.toggleActive(editor.isActive('indent'))
  }
}
