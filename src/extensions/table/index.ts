// @ts-nocheck
import Table from "@tiptap/extension-table";
import { TableView } from "./TableView";
import table from "./../../assets/icons/Editor/table-view.svg";

function createDropDown() {
  const dropdown = document.createElement("div");
  dropdown.className = "dropdown-content";
  dropdown.setAttribute("id", "dropdown-content");
  const a1 = document.createElement("a");
  a1.innerText = "a1";
  const a2 = document.createElement("a");
  a2.innerText = "a2";
  const a3 = document.createElement("a");
  a3.innerText = "a3";
  dropdown.append(a1, a2, a3);
  document.body.appendChild(dropdown);
  return dropdown;
}

function insertTable() {
  const button = this.button;
  const dropdown = document.getElementById('dropdown-content') || createDropDown();

  if (button.classList.contains("toolbar-button-active")) {
    button.classList.remove("toolbar-button-active");
    dropdown.style.display = "none";
  } else {
    button.classList.add("toolbar-button-active");

    if (dropdown.style.display === "block") {
      dropdown.style.display = "none";
    } else {
      dropdown.style.display = "block";
      let buttonRect = this.button.getBoundingClientRect();
      dropdown.style.top = buttonRect.top + buttonRect.height + "px";
      dropdown.style.left = buttonRect.left + "px";
    }
  }
}

const TableCustom = Table.extend({
  addStorage() {
    return {
      icon: table,
      callbackEvent: insertTable,
    };
  },
  addOptions() {
    return {
      ...this.parent?.(),
      View: TableView,
    };
  },
});

export default TableCustom;
