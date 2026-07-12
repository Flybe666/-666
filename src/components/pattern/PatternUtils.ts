export function getTextColor(hex: string) {
  const normalized = hex.replace('#', '')

  const red = Number.parseInt(
    normalized.slice(0, 2),
    16,
  )

  const green = Number.parseInt(
    normalized.slice(2, 4),
    16,
  )

  const blue = Number.parseInt(
    normalized.slice(4, 6),
    16,
  )

  const brightness =
    red * 0.299 +
    green * 0.587 +
    blue * 0.114

  return brightness > 160
    ? '#111827'
    : '#FFFFFF'
}

export function getRowLabel(index: number) {
  let value = index + 1
  let label = ''

  while (value > 0) {
    value -= 1

    label =
      String.fromCharCode(
        65 + (value % 26),
      ) + label

    value = Math.floor(value / 26)
  }

  return label
}