// @ts-nocheck
import Table from "@tiptap/extension-table";
import { TableView } from "./TableView";
import table from "./../../assets/icons/Editor/table-view.svg";
import arrowDropDown from '../../assets/icons/Editor/arrow-drop-down-line.svg'
import Button from "../../editor/ui/Button";

function onSelectTableRowColumn(event) {
  const onColumn = parseInt(event.target.getAttribute("data-column"))
  const onRow = parseInt(event.target.getAttribute("data-row"))
  const buttons = event.target.parentNode.querySelectorAll('button')

  buttons.forEach(element => {
    const column = parseInt(element.getAttribute("data-column"))
    const row = parseInt(element.getAttribute("data-row"))
    if (row <= onRow && column <= onColumn) {
      element.classList.add('grid-button-hover')
    } else {
      element.classList.remove('grid-button-hover')
    }
  });
}

function insertTableRowColumn(event) {
  const columns = parseInt(event.target.getAttribute("data-column"))
  const rows = parseInt(event.target.getAttribute("data-row"))

  this.editor.commands.insertTable({ rows: rows, cols: columns, withHeaderRow: true })
}

function createDropDown(editor) {
  const dropdown = document.createElement("div");
  dropdown.className = "dropdown";
  dropdown.setAttribute("id", "dropdown");

  const dropdownContent = document.createElement("div");
  dropdownContent.className = "dropdown-content";
  dropdownContent.setAttribute("id", "dropdown-content");
  
  for (let row = 1; row <= 10; row++) {
    for (let column = 1; column <= 10; column++) {
      const button = document.createElement('button');
      button.classList.add('grid-button');
      button.setAttribute('data-row', row)
      button.setAttribute('data-column', column)
      button.addEventListener('pointerover', onSelectTableRowColumn)
      button.addEventListener('click', insertTableRowColumn.bind({editor}))
      dropdownContent.appendChild(button);
    }
  }

  dropdown.appendChild(dropdownContent)
  document.body.appendChild(dropdown);

  return dropdown;
}

function showTableGridDropdown(event) {
  event.stopPropagation();
  const button = this.button;
  const dropdown = document.getElementById('dropdown') || createDropDown(this.editor);

  if (button.classList.contains("toolbar-button-active")) {
    button.classList.remove("toolbar-button-active");
    dropdown.style.display = "none";
  } else {
    button.classList.add("toolbar-button-active");

    dropdown.style.display = "block";
    let buttonRect = this.button.getBoundingClientRect();
    dropdown.style.top = buttonRect.top + buttonRect.height + "px";
    dropdown.style.left = buttonRect.left + "px";

    window.onclick = function(event) {
    
      if (!event.target.matches('.dropdown')) {
        let dropdowns = document.getElementsByClassName("dropdown");

        Array.from(dropdowns).forEach(openDropdown => {
          if (openDropdown.style.display === "block") {
            button.classList.remove("toolbar-button-active");
            openDropdown.style.display = "none";
          }
        });
      }
    }
  }

}

const TableCustom = Table.extend({
  addStorage() {
    return {
      toolbarButton: new Button({
        icon: table + arrowDropDown,
        events: {
          'click' : showTableGridDropdown
        }
      })
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
