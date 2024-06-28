import { CellSelection } from '@extensions/table/prosemirror-tables/src'

export function isCellSelection(value: unknown): value is CellSelection {
  return value instanceof CellSelection
}
