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
        const cssWidth = hasWidth ? `${calculatePercentage(hasWidth )}%` : ''

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
          if ((nextDOM as HTMLTableColElement).style.width !== cssWidth) {
            const [propertyKey, propertyValue] = getColStyleDeclaration(cellMinWidth, hasWidth);

            (nextDOM as HTMLTableColElement).style.setProperty(propertyKey, propertyValue)
          }

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

  const realTable = (table.firstElementChild) as HTMLTableElement

  if (fixedWidth || fixed) {
    realTable.classList.add('table-resized')
    table.style.width = `${calculatePercentage(totalWidth)}%`
    table.style.minWidth = ''
  } else {
    table.style.minWidth = `${calculatePercentage(totalWidth)}%`
    table.style.width = ''

  }
}


export function getColStyleDeclaration(minWidth: number, width: number | undefined): [string, string] {
  if (width) {
    // apply the stored width unless it is below the configured minimum cell width
    return ['width', `${calculatePercentage(Math.max(width, minWidth))}%`]
  }

  // set the minimum with on the column if it has no stored width
  return ['min-width', `${calculatePercentage(minWidth)}%`]
}

export function calculatePercentage(totalWidth: number) {
  const percentage = (Number(totalWidth) / 857) * 100
  return Math.min(percentage, 100).toFixed(4)
  //return totalWidth
}