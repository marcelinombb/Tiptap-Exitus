import { Button, type ButtonConfig } from '@editor/ui'
import type ExitusEditor from '@src/ExitusEditor'

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

export interface ToolbarConfig {
  toolbarOrder: string[]
  configStorage: {
    [key: string]: { toolbarButtonConfig: Partial<ButtonConfig> | Partial<ButtonConfig>[] }
  }
}
export class Toolbar {
  editor: ExitusEditor
  toolbarConfig: ToolbarConfig
  toolbarItemsDiv!: HTMLDivElement
  tools: Tool[] = []

  constructor(exitusEditor: ExitusEditor, toolbarConfig: ToolbarConfig) {
    this.editor = exitusEditor
    this.toolbarConfig = toolbarConfig
  }

  setToolbarConfig(toolbarConfig: ToolbarConfig) {
    this.toolbarConfig = toolbarConfig
  }

  closeAllTools() {
    this.tools.forEach(tool => tool.off())
  }

  createToolbar() {
    this.toolbarItemsDiv = document.createElement('div')
    this.toolbarItemsDiv.className = 'ex-toolbar-items'

    const { configStorage, toolbarOrder } = this.toolbarConfig
    toolbarOrder.forEach(item => {
      const tool = getExtensionStorage(configStorage, item)
      if (item == '|') {
        const separator = document.createElement('span')
        separator.className = 'ex-toolbar-separator'
        this.toolbarItemsDiv?.append(separator)
      } else if (!isEmptyObject(tool)) {
        const toolbarButtonConfig = Array.isArray(tool.toolbarButtonConfig) ? tool.toolbarButtonConfig : [tool.toolbarButtonConfig]

        toolbarButtonConfig.forEach((config: any) => {
          if (config?.dropdown) {
            const dropdown = config?.dropdown({ editor: this.editor })
            const button = new Button(this.editor, config)
            dropdown.setParentToolbar(this)
            dropdown.setButton(button)
            this.tools.push(dropdown)
            this.toolbarItemsDiv?.append(dropdown.render())
          } else {
            const button = new Button(this.editor, config)
            button.setParentToolbar(this)
            this.tools.push(button)
            button.bind('click', config.events['click'])
            this.toolbarItemsDiv?.append(button.render())
          }
        })
      }
    })

    return this.toolbarItemsDiv
  }
}
