import { type Editor } from '@tiptap/core'

import type ExitusEditor from '../../ExitusEditor'
import { Button } from '../ui'

import { type Tool } from './Tool'

function getExtensionStorage(editor: Editor, name: string) {
  const storage = editor.extensionStorage[name]
  return storage
}

function isEmptyObject(obj: object) {
  return Object.keys(obj).length === 0
}

class Toolbar {
  editor: ExitusEditor
  toolbarItems: string[]
  toolbarItemsDiv: HTMLDivElement
  tools: Tool[] = []

  constructor(exitusEditor: ExitusEditor, toolbar: string[]) {
    this.editor = exitusEditor
    this.toolbarItems = toolbar
    this.toolbarItemsDiv = exitusEditor.toolbarItemsDiv
  }

  createToolbar() {
    this.toolbarItems.forEach(item => {
      const tool = getExtensionStorage(this.editor, item)

      if (!isEmptyObject(tool)) {
        const toolbarButtonConfig = tool.toolbarButtonConfig

        if (toolbarButtonConfig?.dropdown) {
          const dropdown = toolbarButtonConfig?.dropdown({ editor: this.editor })
          const button = new Button(this.editor, toolbarButtonConfig)
          dropdown.setButton(button)

          this.tools.push(dropdown)
          this.toolbarItemsDiv?.append(dropdown.render())
        } else {
          const button = new Button(this.editor, toolbarButtonConfig)
          this.tools.push(button)
          button.bind('click', toolbarButtonConfig.events['click'])
          this.toolbarItemsDiv?.append(button.render())
        }
      }
    })
  }
}

export default Toolbar
