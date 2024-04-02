import type ExitusEditor from '../../ExitusEditor'

export interface EventProps {
  editor: ExitusEditor
  button: HTMLButtonElement
  event: Event
}

export interface ButtonConfig {
  icon: string
  label?: string
  attributes?: object[]
  classList?: string[]
  events?: {
    [key: string]: (obj: EventProps) => void
  }
  checkActive?: string | object
}

const defaultConfig: ButtonConfig = {
  icon: '',
  classList: []
}

export class Button {
  config: ButtonConfig
  button: HTMLButtonElement
  editor: ExitusEditor
  constructor(editor: ExitusEditor, config: ButtonConfig) {
    this.config = { ...defaultConfig, ...config }
    this.editor = editor
    this.button = this.createButton()
  }

  setEditor(editor: ExitusEditor) {
    this.editor = editor
  }

  createButton() {
    const button = document.createElement('button')
    button.classList.add('ex-toolbar-button', ...(this.config.classList as string[]))
    button.setAttribute('id', `${Math.floor(Math.random() * 100) + 1}`)
    return button
  }

  bindEvents() {
    const events = this.config.events
    for (const key in events) {
      const currying = (editor: ExitusEditor, button: HTMLButtonElement) => {
        return (event: any) => {
          events[key]({
            event,
            editor,
            button
          })
        }
      }
      this.button.addEventListener(key, currying(this.editor, this.button) as EventListener)
    }
  }

  checkActive() {
    if (this.config.checkActive != undefined) {
      this.editor.on('selectionUpdate', () => {
        if (this.editor.isActive(this.config?.checkActive as string | object)) {
          this.button.classList.add('ex-button-active')
        } else {
          this.button.classList.remove('ex-button-active')
        }
      })
    }
  }

  generateButton() {
    this.bindEvents()
    this.checkActive()
    this.button.innerHTML = this.config.icon
    return this.button
  }

  getButtonElement(): HTMLButtonElement {
    return this.button
  }
}
