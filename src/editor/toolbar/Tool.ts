export interface Tool {
  on(): void
  off(): void
  render(): HTMLElement
}
