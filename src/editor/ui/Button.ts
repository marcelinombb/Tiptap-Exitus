import { type Editor } from '@tiptap/core'

export interface ButtonConfig {
  icon: string
  label?: string
  attributes?: object[]
  events?: {
    [key: string]: (...args: any) => void
  }
}
export default class Button {
  config: ButtonConfig
  button: HTMLButtonElement
  editor: Editor
  constructor(editor: Editor, config: ButtonConfig) {
    this.config = config
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
      //events[key] = event => events[key](event, this.editor, this.button)
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

  removeEvents() {
    const events = this.config.events
    for (const key in events) {
      this.button.removeEventListener(key, events[key] as EventListener)
    }
  }

  generateButton() {
    this.bindEvents()
    this.button.innerHTML = this.config.icon
    return this.button
  }
}
