// @ts-nocheck
import Table from "@tiptap/extension-table";
import { TableView } from "./TableView";
import table from "./../../assets/icons/Editor/table-view.svg"

const TableCustom = Table.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      View: TableView,
      icon: table,
    };
  },
  onSelectionUpdate({ editor }) {
    if (editor.isActive(this.name)) {
      console.log("Tabela selecionada");
    }
  }
});

export default TableCustom