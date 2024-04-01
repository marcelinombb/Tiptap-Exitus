import { type Editor } from '@tiptap/core'

export interface EventProps {
  editor: Editor
  button: HTMLButtonElement
  event: Event
}

export interface ButtonConfig {
  icon: string
  label?: string
  attributes?: object[]
  events?: {
    [key: string]: (obj: EventProps) => void
  }
  checkActive?: string | object
}

const defaultConfig: ButtonConfig = {
  icon: ''
}

export class Button {
  config: ButtonConfig
  button: HTMLButtonElement
  editor: Editor
  constructor(editor: Editor, config: ButtonConfig) {
    this.config = { ...defaultConfig, ...config }
    this.editor = editor
    this.button = this.createButton()
  }

  setEditor(editor: Editor) {
    this.editor = editor
  }

  createButton() {
    const button = document.createElement('button')
    button.className = 'ex-toolbar-button'
    button.setAttribute('id', `${Math.floor(Math.random() * 100) + 1}`)
    return button
  }

  bindEvents() {
    const events = this.config.events
    for (const key in events) {
      const currying = (editor: Editor, button: HTMLButtonElement) => {
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
