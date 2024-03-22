// @ts-nocheck
import { Bold as BoldBase } from "@tiptap/extension-bold";
import bold from "../../assets/icons/Editor/bold.svg";

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
      icon: bold,
      callbackEvent: toggleBold,
      toolbarButton: null,
    };
  },
  onSelectionUpdate({ editor }) {
    const button = this.storage.toolbarButton
    
    if (editor.isActive(this.name)) {
      button.classList.add("toolbar-button-active");
    } else {
      button.classList.remove("toolbar-button-active");
    }
  },
});

export default Bold;
