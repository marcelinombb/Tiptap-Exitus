import { type Toolbar } from '@editor/toolbar'

import type ExitusEditor from '../../ExitusEditor'
import { type Tool } from '../toolbar/Tool'

import { type Button, type ButtonEventProps } from '.'

export interface DropDownEventProps extends ButtonEventProps {
  dropdown: Dropdown
}

export interface DropdownConfig {
  events: {
    [key: string]: (obj: DropDownEventProps) => void
  }
  classes: string[]
}

export class Dropdown implements Tool {
  isOpen = false
  dropdownContainer!: HTMLElement
  dropdownContentContainer!: HTMLElement
  dropdownContent!: HTMLElement
  config: DropdownConfig = {
    classes: [],
    events: {}
  }
  button!: Button
  editor: ExitusEditor
  parentToolbar!: Toolbar

  constructor(editor: ExitusEditor, config: DropdownConfig) {
    this.config = { ...this.config, ...config }
    this.editor = editor
    this.dropdownContainer = document.createElement('div')
    this.dropdownContainer.className = 'ex-dropdown-container'

    this.dropdownContentContainer = document.createElement('div')
    this.dropdownContentContainer.classList.add('ex-dropdown', ...this.config.classes)

    this.dropdownContent = document.createElement('div')
    this.dropdownContent.classList.add('ex-dropdown-content')
  }

  setButton(button: Button) {
    this.button = button
  }

  setDropDownContent(contents: HTMLElement) {
    this.dropdownContent = contents
  }

  setParentToolbar(toolbar: Toolbar) {
    this.parentToolbar = toolbar
  }

  on() {
    this.editor.toolbar.tools.forEach(tool => tool instanceof Dropdown && tool.off())
    this.dropdownContentContainer.style.display = 'block'
    this.isOpen = true
  }

  off() {
    this.isOpen = false
    this.dropdownContentContainer.style.display = 'none'
  }

  render() {
    this.button.bind('click', ({ editor, event, button }) => {
      this.config.events['open']({ editor, event, button, dropdown: this })
    })
    this.dropdownContentContainer.appendChild(this.dropdownContent)
    this.dropdownContainer.append(this.button.render(), this.dropdownContentContainer)
    return this.dropdownContainer
  }
}
