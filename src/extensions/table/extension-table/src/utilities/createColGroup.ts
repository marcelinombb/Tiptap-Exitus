import { type DOMOutputSpec, type Node as ProseMirrorNode } from '@tiptap/pm/model'

/**
 * Creates a colgroup element for a table node in ProseMirror.
 *
 * @param node - The ProseMirror node representing the table.
 * @param cellMinWidth - The minimum width of a cell in the table.
 * @param overrideCol - (Optional) The index of the column to override the width of.
 * @param overrideValue - (Optional) The width value to use for the overridden column.
 * @returns An object containing the colgroup element, the total width of the table, and the minimum width of the table.
 */
export function createColGroup(node: ProseMirrorNode, cellMinWidth: number, overrideCol?: number, overrideValue?: any) {
  let totalWidth = 0
  let fixedWidth = true
  const cols: DOMOutputSpec[] = []
  const row = node.firstChild

  if (!row) {
    return {}
  }

  for (let i = 0, col = 0; i < row.childCount; i += 1) {
    const { colspan, colwidth } = row.child(i).attrs

    for (let j = 0; j < colspan; j += 1, col += 1) {
      const hasWidth = (overrideCol === col ? overrideValue : colwidth && colwidth[j]) ?? 100
      const cssWidth = hasWidth ? `${(Number(hasWidth) / 857) * 100}%` : ''

      totalWidth += hasWidth || cellMinWidth

      if (!hasWidth) {
        fixedWidth = false
      }

      cols.push(['col', cssWidth ? { style: `width: ${cssWidth}` } : {}])
    }
  }

  const tableWidth = fixedWidth ? `${(Number(totalWidth) / 857) * 100}%` : ''
  const tableMinWidth = fixedWidth ? '' : `${(Number(totalWidth) / 857) * 100}%`

  const colgroup: DOMOutputSpec = ['colgroup', {}, ...cols]

  return { colgroup, tableWidth, tableMinWidth }
}
