import { Node } from 'prosemirror-model';
import { NodeView, ViewMutationRecord } from 'prosemirror-view';
//import { CellAttrs } from './util';

/**
 * @public
 */
export class TableView implements NodeView {
  public dom: HTMLDivElement;
  public table: HTMLTableElement;
  public colgroup: HTMLTableColElement;
  public contentDOM: HTMLTableSectionElement;

  constructor(public node: Node, public cellMinWidth: number) {
    this.dom = document.createElement('div');
    this.dom.className = 'tableWrapper';
    this.table = this.dom.appendChild(document.createElement('table'));
    this.colgroup = this.table.appendChild(document.createElement('colgroup'));
    updateColumnsOnResize(node, this.colgroup, this.table, cellMinWidth);
    this.contentDOM = this.table.appendChild(document.createElement('tbody'));
  }

  update(node: Node): boolean {
    if (node.type != this.node.type) return false;
    this.node = node;
    updateColumnsOnResize(node, this.colgroup, this.table, this.cellMinWidth);
    return true;
  }

  ignoreMutation(record: ViewMutationRecord): boolean {
    return (
      record.type == 'attributes' &&
      (record.target == this.table || this.colgroup.contains(record.target))
    );
  }
}

/**
 * @public
 */
export function updateColumnsOnResize(
  node: Node,
  colgroup: HTMLTableColElement,
  table: HTMLTableElement,
  cellMinWidth: number,
  overrideCol?: number,
  overrideValue?: number,
  fixed: boolean = false
): void {
  let totalWidth = 0;
  let fixedWidth = true;
  let nextDOM = colgroup.firstChild;
  const row = node.firstChild;
  if (row !== null) {
    for (let i = 0, col = 0; i < row.childCount; i += 1) {
      const { colspan, colwidth } = row.child(i).attrs

      for (let j = 0; j < colspan; j += 1, col += 1) {
        const hasWidth = overrideCol === col ? overrideValue : (colwidth && colwidth[j]) as number | undefined

        totalWidth += hasWidth || cellMinWidth

        if (!hasWidth) {
          fixedWidth = false
        }

        if (!nextDOM) {
          const colElement = document.createElement('col')

          const [propertyKey, propertyValue] = getColStyleDeclaration(cellMinWidth, hasWidth)

          colElement.style.setProperty(propertyKey, propertyValue)

          colgroup.appendChild(colElement)
        } else {
          const [propertyKey, propertyValue] = getColStyleDeclaration(cellMinWidth, hasWidth);

          (nextDOM as HTMLTableColElement).style.setProperty(propertyKey, propertyValue)

          nextDOM = nextDOM.nextSibling
        }
      }
    }
  }

  while (nextDOM) {
    const after = nextDOM.nextSibling

    nextDOM.parentNode?.removeChild(nextDOM)
    nextDOM = after
  }

  const maxTableWidth = 857 
  const finalTableWidth = Math.min(totalWidth, maxTableWidth)

  if (fixedWidth || fixed) {
    table.classList.add('table-resized')
    table.style.width = `${finalTableWidth}px`
    table.style.minWidth = ''
  } else {
    table.style.minWidth = `${finalTableWidth}px`
    table.style.width = ''
  }
}


export function getColStyleDeclaration(minWidth: number, width: number | undefined): [string, string] {
  if (width) {
    const maxWidth = 857 
    const finalWidth = Math.min(Math.max(width, minWidth), maxWidth)
    return ['width', `${finalWidth}px`]
  }

  return ['min-width', `${minWidth}px`]
}

export function calculatePercentage(totalWidth: number) {
  const maxWidth = 857 
  return Math.min(Number(totalWidth), maxWidth)
}
