import { Editor } from "@tiptap/core";
import Toolbar from "./editor/toolbar";

export interface options {
  container: HTMLElement;
  toolbar: string[];
  defaultContent: string;
}

class ExitusEditor {
  options: options;
  editor: Editor;
  toolbar: Toolbar

  static extensions: any;
  
  constructor(options: options) {
    this.options = options;
    this.editor = this.createEditor();
    this.toolbar = new Toolbar(this.editor, this.options.toolbar)
    this.toolbar.createToolbar()
  }

  createEditor() {
    const editor = new Editor({
      element: this.options.container,
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
