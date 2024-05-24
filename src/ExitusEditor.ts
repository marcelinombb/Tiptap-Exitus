import { Toolbar } from '@editor/toolbar'
import { createHTMLElement } from '@editor/utils'
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
  editorInstance!: string
  toolbar: Toolbar
  toolbarItemsDiv!: HTMLDivElement
  editorMainDiv!: HTMLDivElement

  static extensions: AnyExtension[]

  constructor(options: Partial<ExitusEditorOptions> = {}) {
    super({ ...options, extensions: ExitusEditor.extensions })
    this.editorInstance = generateUUID()

    this.toolbar = new Toolbar(this, {
      toolbarOrder: options.toolbar as string[],
      configStorage: this.extensionStorage
    })

    this._createUI(options.container as Element)
  }

  private _generateEditorUI() {
    const toolbarItems = this.toolbar.createToolbar()
    const toolbarEditor = createHTMLElement('div', { class: 'ex-toolbar-editor' }, [toolbarItems])

    const editorMain = this.options.element
    editorMain.className = 'editor-main'
    editorMain.setAttribute('spellcheck', 'false')
    editorMain.setAttribute('id', generateUUID())
    this.editorMainDiv = editorMain as HTMLDivElement

    const editorScroller = createHTMLElement('div', { class: 'editor-scroller' }, [editorMain])

    const editorShell = createHTMLElement('div', { class: 'editor-shell' }, [toolbarEditor, editorScroller])

    this.toolbarItemsDiv = toolbarItems

    return editorShell
  }

  private _createUI(container: Element) {
    const editorUI = this._generateEditorUI()
    container.appendChild(editorUI)
  }
}

export default ExitusEditor
