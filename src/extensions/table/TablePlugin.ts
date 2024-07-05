import { Plugin } from '@editor/Plugin'
import { Button, Dropdown } from '@editor/ui'
import TableCell from '@extensions/table-cell/src'
import arrowDropDown from '@icons/arrow-drop-down-line.svg'
import table from '@icons/table-2.svg'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

import { TableCustom } from './table'

export class TablePlugin extends Plugin {
  static get pluginName() {
    return 'table'
  }

  static get requires() {
    return [
      TableCustom.configure({
        resizable: true,
        allowTableNodeSelection: true,
        cellMinWidth: 100
      }),
      TableRow,
      TableHeader,
      TableCell
    ]
  }

  init(): void {
    const config = {
      icon: table + arrowDropDown,
      dropdown: this.tableDropDown,
      tooltip: 'Inserir tabela'
    }
    const dropdown = new Dropdown(this.editor, [])
    const button = new Button(this.editor, config)
    dropdown.setParentToolbar(this.editor.toolbar)
    dropdown.setButton(button)
    this.editor.toolbar.setTool(TablePlugin.pluginName, dropdown)
  }

  tableDropDown() {}
}
