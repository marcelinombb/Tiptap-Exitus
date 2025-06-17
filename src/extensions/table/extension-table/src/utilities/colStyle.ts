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
