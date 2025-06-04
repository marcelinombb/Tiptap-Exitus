import { type Toolbar } from '@editor/toolbar'
import { createHTMLElement } from '@editor/utils'
import type ExitusEditor from '@src/ExitusEditor'

import { type Tool } from '../toolbar/Tool'

export type ButtonEventProps = {
  editor: ExitusEditor
  button: Button
  event: Event
}
interface Attrs {
  [key: string]: any
}
export interface ButtonConfig {
  icon: string
  label: string
  title: string
  attributes: Attrs
  classList: string[]
  click: (obj: ButtonEventProps) => void
  checkActive: string | object
  tooltip?: string
}

const defaultConfig: Partial<ButtonConfig> = {
  icon: '',
  label: '',
  title: '',
  classList: []
}

export class Button implements Tool {
  config: Partial<ButtonConfig>
  button: HTMLButtonElement | null = null
  editor: ExitusEditor | null = null
  events: { [key: string]: (obj: ButtonEventProps) => void } = {}
  constructor(
    editor: ExitusEditor | null,
    config: Partial<ButtonConfig>,
    public name: string = ''
  ) {
    this.config = { ...defaultConfig, ...config }
    this.editor = editor
    //this.button = this.createButton()
  }

  update(toolbar: Toolbar): void {
    if (toolbar.currentActive === this.name) return
    this.off()
  }

  setEditor(editor: ExitusEditor) {
    this.editor = editor
  }

  createButton(): HTMLButtonElement {
    const button = createHTMLElement<HTMLButtonElement>('button', {
      class: ['ex-toolbar-button', ...(this.config.classList as string[])].join(' '),
      id: `${Math.floor(Math.random() * 100) + 1}`,
      ...this.config.attributes
    })

    if (!this.editor!.isEditable) {
      button.setAttribute('disabled', '')
      button.classList.add('ex-button-disabled')
    }

    return button
  }

  bindEvents() {
    const click = this.config.click
    //for (const key in events) {
    if (click != undefined) {
      this.bind('click', click)
    }
    //}
  }

  bind(eventName: string, callback: (obj: ButtonEventProps) => void) {
    this.events[eventName] = callback
  }

  private listenEvents() {
    for (const eventName in this.events) {
      this.button!.addEventListener(eventName, (event: Event) => {
        event.stopPropagation()
        event.preventDefault()
        if (this.editor) {
          this.events[eventName]({
            editor: this.editor,
            button: this,
            event: event
          })
        }
      })
    }
  }

  on() {
    this.button!.classList.add('ex-button-active')
  }

  off() {
    this.button!.classList.remove('ex-button-active')
  }

  toggle() {
    this.button!.classList.toggle('ex-button-active')
  }

  toggleActive(on: boolean) {
    this.button!.classList.toggle('ex-button-active', on)
  }

  active() {
    return this.button!.classList.contains('ex-button-active')
  }

  createTooltip(parent: HTMLButtonElement, tooltipText: string) {
    const tooltip = document.createElement('div')
    tooltip.className = 'ex-tooltip ex-tooltip-arrow ex-reset-all ex-hidden'
    const tooltipMessage = tooltip.appendChild(document.createElement('span'))
    tooltipMessage.className = 'ex-tooltip-text'
    tooltipMessage.innerText = tooltipText
    parent.appendChild(tooltip)
    parent.addEventListener('pointerover', () => {
      const showDelay = setTimeout(() => {
        tooltip.classList.remove('ex-hidden')
      }, 500)

      parent.addEventListener('pointerleave', () => {
        tooltip.classList.add('ex-hidden')
        clearTimeout(showDelay)
      })

      parent.addEventListener('click', () => {
        tooltip.classList.add('ex-hidden')
        clearTimeout(showDelay)
      })
    })

    return parent
  }

  render() {
    //this.editorCheckActive()
    this.button = this.createButton()
    this.listenEvents()
    this.button.innerHTML = (this.config?.icon as string) + (this.config?.label as string)
    if (this.config.tooltip) {
      this.createTooltip(this.button, this.config.tooltip)
    }
    return this.button
  }

  getButtonElement(): HTMLButtonElement | null {
    return this.button
  }
}
