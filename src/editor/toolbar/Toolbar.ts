import { type ButtonConfig } from '@editor/ui'
import type ExitusEditor from '@src/ExitusEditor'

import { type Tool } from './Tool'

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
  //toolbarConfig: ToolbarConfig
  toolbarItemsDiv!: HTMLDivElement
  private tools = new Map<string, Tool>()
  constructor(
    public editor: ExitusEditor,
    public toolbarOrder: string[]
  ) {}

  setTool(name: string, tool: Tool) {
    if (this.tools.has(name)) {
      throw new Error('Duplicated Tool')
    }
    this.tools.set(name, tool)
  }

  getTool(name: string) {
    return this.tools.get(name)
  }

  /* setToolbarConfig(toolbarConfig: ToolbarConfig) {
    this.toolbarConfig = toolbarConfig
  }
 */
  closeAllTools() {
    this.tools.forEach(tool => tool.off())
  }

  render() {
    this.toolbarItemsDiv = document.createElement('div')
    this.toolbarItemsDiv.className = 'ex-toolbar-items'
    this.toolbarOrder.forEach(item => {
      if (item == '|') {
        const separator = document.createElement('span')
        separator.className = 'ex-toolbar-separator'
        this.toolbarItemsDiv?.append(separator)
      } else {
        const tool = this.getTool(item)
        if (tool) {
          this.toolbarItemsDiv?.append(tool.render())
        }
      }
    })
  }

  /* createToolbar() {
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
            const dropdown = config?.dropdown({ editor: this.editor }) as Dropdown
            const button = new Button(this.editor, config)
            dropdown.setParentToolbar(this)
            dropdown.setButton(button)
            this.tools.push(dropdown)
            this.toolbarItemsDiv?.append(dropdown.render())
          } else {
            const button = new Button(this.editor, config)
            button.setParentToolbar(this)
            this.tools.push(button)
            button.bind('click', config.click)
            this.toolbarItemsDiv?.append(button.render())
          }
        })
      }
    })

    return this.toolbarItemsDiv
  } */
}
