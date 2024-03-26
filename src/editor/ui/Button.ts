import { Editor } from "@tiptap/core"

export interface ButtonConfig {
    icon: string
    label?: string
    attributes?: Object[]
    events?: {
        [key: string] : Function
    }
}
export default class Button {
    config: ButtonConfig;
    button: HTMLButtonElement;
    editor!: Editor
    constructor(config : ButtonConfig) {
        this.config = config
        this.button = this.createButton()
    }

    setEditor(editor: Editor) {
        this.editor =  editor
    }

    createButton() {
        const button = document.createElement("button");
        button.className = "toolbar-button";
        return button
    }
    
    bindEvents() {
        const events = this.config.events
        for (const key in events) {
            events[key] = events[key].bind(this)
            this.button.addEventListener(key, events[key] as EventListener)
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