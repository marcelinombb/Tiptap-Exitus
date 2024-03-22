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

  constructor(editor: Editor, toolbarItems: string[]) {
    this.editor = editor;
    this.toolbarItems = toolbarItems;
  }

  createButton(icon: string) {
    const button = document.createElement("button");
    button.className = "toolbar-button";
    button.innerHTML = icon;
    return button;
  }

  createToolbar() {
    const titems = document.querySelector<HTMLDivElement>(".toolbar-items");
    this.toolbarItems.forEach((item) => {
      const tool = getExtensionStorage(this.editor, item);

      if (!isEmptyObject(tool)) {
        const button = this.createButton(tool.icon);
        button.addEventListener(
          "click",
          tool.callbackEvent.bind({
            button,
            editor: this.editor,
          })
        );
        tool.toolbarButton = button;
        titems?.appendChild(button);
      }
    });
  }
}

export default Toolbar;
