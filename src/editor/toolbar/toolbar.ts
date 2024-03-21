import { Editor } from "@tiptap/core"

function getExtensionOptions(editor: Editor, name: string) {
    const extension = editor.extensionManager.extensions.find(extension => extension.name === name)
  
    return extension!.options
}

class Toolbar {

    editor: Editor
    toolbarItems: string[]

    constructor(editor: Editor, toolbarItems: string[]) {
        this.editor = editor
        this.toolbarItems = toolbarItems
    }

    createButton(icon: string) {
        const button = document.createElement('button')
        button.className=  'toolbar-button'
        button.innerHTML = icon
        return button
    }

    createToolbar() {
        this.toolbarItems.forEach(item => {
            console.log(getExtensionOptions(this.editor, item));
        });
    }
    
}

export default Toolbar