import { Editor } from "@tiptap/core";

function getExtensionStorage(editor: Editor, name: string) {
  const storage = editor.extensionStorage[name];
  return storage;
}

function isEmptyObject(obj: Object) {
  return Object.keys(obj).length === 0;
}

class Toolbar {
  editor: Editor;
  toolbarItems: string[];
  toolbarItemsDiv: HTMLDivElement;

  constructor(editor: Editor, toolbarItems: string[], toolbarItemsDiv: HTMLDivElement) {
    this.editor = editor;
    this.toolbarItems = toolbarItems;
    this.toolbarItemsDiv = toolbarItemsDiv
  }

  createToolbar() {
    this.toolbarItems.forEach((item) => {
    const tool = getExtensionStorage(this.editor, item);

      if (!isEmptyObject(tool)) {
        const toolbarButton = tool.toolbarButton;
        toolbarButton.setEditor(this.editor)
        this.toolbarItemsDiv?.appendChild(toolbarButton.generateButton());
      }
    });
  }
}

export default Toolbar;
