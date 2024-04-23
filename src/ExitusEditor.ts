import { Toolbar } from '@editor/toolbar'
import { type AnyExtension, Editor, type EditorOptions } from '@tiptap/core'

export interface ExitusEditorOptions extends EditorOptions {
  container: Element
  toolbar: string[]
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

class ExitusEditor extends Editor {
  updateAttrs(nodeId: string | undefined, arg1: { width: number; height: number }) {
    throw new Error('Method not implemented.')
  }
  editorInstance!: string
  toolbar: Toolbar
  toolbarItemsDiv!: HTMLDivElement
  editorMainDiv!: HTMLDivElement

  static extensions: AnyExtension[]

  constructor(options: Partial<ExitusEditorOptions> = {}) {
    super({ ...options, extensions: ExitusEditor.extensions })
    this._createUI(options.container as Element)
    this.editorInstance = generateUUID()
    this.toolbar = new Toolbar(this, {
      toolbarOrder: options.toolbar as string[],
      configStorage: this.extensionStorage
    })
    this.toolbar.createToolbar(this.toolbarItemsDiv)
  }

  _generateEditorUI() {
    const editorShell = document.createElement('div')
    editorShell.className = 'editor-shell'

    const toolbarEditor = document.createElement('div')
    toolbarEditor.className = 'ex-toolbar-editor'

    const toolbarItems = document.createElement('div')
    toolbarItems.className = 'ex-toolbar-items'

    toolbarEditor.appendChild(toolbarItems)

    const editorScroller = document.createElement('div')
    editorScroller.className = 'editor-scroller'

    const editorMain = this.options.element
    editorMain.className = 'editor-main'
    editorMain.setAttribute('id', generateUUID())

    editorScroller.appendChild(editorMain)

    editorShell.append(toolbarEditor, editorScroller)

    this.toolbarItemsDiv = toolbarItems

    return editorShell
  }

  _createUI(container: Element) {
    const editorUI = this._generateEditorUI()
    container.appendChild(editorUI)
  }
}

export default ExitusEditor
