import type ExitusEditor from '../../ExitusEditor'
import { Button } from '../ui'

import { type Tool } from './Tool'

function getExtensionStorage(configStorage: ConfigStorage, name: string) {
  const storage = configStorage[name]
  return storage
}

function isEmptyObject(obj: object) {
  return Object.keys(obj).length === 0
}

type ConfigStorage = {
  [key: string]: { toolbarButtonConfig: object | object[] }
}

class Toolbar {
  editor: ExitusEditor
  toolbarItems: string[]
  toolbarItemsDiv: HTMLDivElement
  tools: Tool[] = []

  constructor(exitusEditor: ExitusEditor, toolbarItemsDiv: HTMLDivElement, toolbar: string[]) {
    this.editor = exitusEditor
    this.toolbarItems = toolbar
    this.toolbarItemsDiv = toolbarItemsDiv
  }

  createToolbar(configStorage: ConfigStorage) {
    //console.log(this.editor.extensionStorage)

    this.toolbarItems.forEach(item => {
      const tool = getExtensionStorage(configStorage, item)

      if (!isEmptyObject(tool)) {
        const toolbarButtonConfig = Array.isArray(tool.toolbarButtonConfig) ? tool.toolbarButtonConfig : [tool.toolbarButtonConfig]

        toolbarButtonConfig.forEach((config: any) => {
          if (config?.dropdown) {
            const dropdown = config?.dropdown({ editor: this.editor })
            const button = new Button(this.editor, config)
            dropdown.setButton(button)
            this.tools.push(dropdown)
            this.toolbarItemsDiv?.append(dropdown.render())
          } else {
            const button = new Button(this.editor, config)
            this.tools.push(button)
            button.bind('click', config.events['click'])
            this.toolbarItemsDiv?.append(button.render())
          }
        })
      }
    })
  }
}

export default Toolbar
