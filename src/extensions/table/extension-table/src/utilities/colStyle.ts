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
