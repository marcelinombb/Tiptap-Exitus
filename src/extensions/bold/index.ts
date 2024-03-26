// @ts-nocheck
import { Bold as BoldBase } from "@tiptap/extension-bold";
import bold from "../../assets/icons/Editor/bold.svg";
import Button from "../../editor/ui/Button";
import { Editor } from "@tiptap/core";

function toggleBold() {
  this.editor.chain().focus().toggleBold().run();
  if (this.editor.isActive('bold')) {
    this.button.classList.add("toolbar-button-active");
  } else {
    this.button.classList.remove("toolbar-button-active");
  }
}

const Bold = BoldBase.extend({
  addStorage() {
    return {
      toolbarButton: new Button({
        icon: bold,
        events: {
          "click": toggleBold
        }
      }),
    };
  },
  onSelectionUpdate() {
    const button = this.storage.toolbarButton.button
    
    if (this.editor.isActive(this.name)) {
      button.classList.add("toolbar-button-active");
    } else {
      button.classList.remove("toolbar-button-active");
    }
  },
});

export default Bold;
