import { Editor } from '@tiptap/core'

import Toolbar from './editor/toolbar'

export interface options {
  container: HTMLElement
  toolbar: string[]
  defaultContent: string
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

class ExitusEditor {
  options: options
  editor: Editor
  toolbar: Toolbar
  toolbarItemsDiv!: HTMLDivElement
  editorMainDiv!: HTMLDivElement

  static extensions: any

  constructor(options: options) {
    this.options = options
    this.editor = this._createEditor()
    this.toolbar = new Toolbar(this)
    this.toolbar.createToolbar()
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

    const editorMain = document.createElement('div')
    editorMain.className = 'editor-main'
    editorMain.setAttribute('id', generateUUID())

    editorScroller.appendChild(editorMain)

    editorShell.append(toolbarEditor, editorScroller)

    this.toolbarItemsDiv = toolbarItems
    this.editorMainDiv = editorMain

    return editorShell
  }

  _createEditor() {
    const editorUI = this._generateEditorUI()

    this.options.container.appendChild(editorUI)

    const editor = new Editor({
      element: this.editorMainDiv,
      extensions: ExitusEditor.extensions,
      content: this.options.defaultContent
    })

    return editor
  }

  getEditor() {
    return this.editor
  }
}

export default ExitusEditor
