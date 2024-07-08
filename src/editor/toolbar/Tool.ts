import { type Toolbar } from './Toolbar'

export interface Tool {
  name: string
  on(): void
  off(): void
  update(toolbar: Toolbar): void
  render(): HTMLElement
}
