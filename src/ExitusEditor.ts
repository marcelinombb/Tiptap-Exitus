import { Editor } from "@tiptap/core";
import Toolbar from "./editor/toolbar";

export interface options {
  container: HTMLElement;
  toolbar: string[];
  defaultContent: string;
}

class ExitusEditor {
  options: options
  editor: Editor
  toolbar: Toolbar
  toolbarItemsDiv!: HTMLDivElement
  editorMainDiv!: HTMLDivElement

  static extensions: any;
  
  constructor(options: options) {
    this.options = options;
    this.editor = this._createEditor();
    this.toolbar = new Toolbar(this.editor, this.options.toolbar, this.toolbarItemsDiv)
    this.toolbar.createToolbar()
  }

  _generateEditorUI() {

    const editorShell = document.createElement('div')
    editorShell.className = 'editor-shell'

    const toolbarEditor = document.createElement('div')
    toolbarEditor.className = 'toolbar-editor'

    const toolbarItems =document.createElement('div')
    toolbarItems.className = 'toolbar-items'

    toolbarEditor.appendChild(toolbarItems)

    const editorScroller = document.createElement('div')
    editorScroller.className = 'editor-scroller'

    const editorContainer = document.createElement('div')
    editorContainer.className = 'editor-container'

    const editorMain = document.createElement('div')
    editorMain.className = 'editor-main'

    editorContainer.appendChild(editorMain)
    editorScroller.appendChild(editorContainer)

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
      content: this.options.defaultContent,
    });

    return editor;
  }

  getEditor() {
    return this.editor;
  }
}

export default ExitusEditor;
