import { Plugin } from '@editor/Plugin'
import formatClearIcon from '@icons/format-clear.svg'

export class FormatClear extends Plugin {
  static get pluginName(): string {
    return 'formatClear'
  }

  init(): void {
    this.editor.toolbar.setButton('formatClear', {
      icon: formatClearIcon,
      tooltip: 'limpar formatação',
      click: () => this.editor.chain().clearNodes().unsetAllMarks().run()
    })
  }
  destroy(): void {}
}
