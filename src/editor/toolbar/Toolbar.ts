import { Button, type ButtonConfig, Dropdown, type DropdownConfig, type DropDownEventProps } from '@editor/ui'
import type ExitusEditor from '@src/ExitusEditor'

import { type Tool } from './Tool'
export interface ToolbarConfig {
  toolbarOrder: string[]
  configStorage: {
    [key: string]: { toolbarButtonConfig: Partial<ButtonConfig> | Partial<ButtonConfig>[] }
  }
}
export class Toolbar {
  toolbarItemsDiv!: HTMLDivElement
  private tools = new Map<string, Tool>()
  currentActive!: string
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

  notifyAllTools() {
    this.tools.forEach((tool, _key) => {
      tool.update(this)
    })
  }

  setButton(name: string, buttonConfig: Partial<ButtonConfig>) {
    const button = new Button(this.editor, buttonConfig, name)

    button.bind('click', props => {
      buttonConfig.click!(props)
      this.currentActive = props.button.name
      this.notifyAllTools()
    })

    this.setTool(name, button)
  }

  setDropDown(name: string, dropdownConfig: DropdownConfig, dropdownContent: (dropdown: Dropdown) => HTMLElement) {
    const newDropdownConfig = {
      ...dropdownConfig,
      click: (props: DropDownEventProps) => {
        dropdownConfig.click(props)
        this.currentActive = props.dropdown.name
        this.notifyAllTools()
      }
    }

    const dropdown = new Dropdown(this.editor, newDropdownConfig, name)

    dropdown.setDropDownContent(dropdownContent(dropdown))

    this.setTool(name, dropdown)
  }

  getTool(name: string) {
    return this.tools.get(name)
  }

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
    return this.toolbarItemsDiv
  }
}
