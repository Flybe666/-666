import type { BeadCell } from './grid'

export interface ColorStatistic {
  id: string
  name: string
  hex: string
  count: number
}

export function calculateColorStatistics(
  cells: BeadCell[],
): ColorStatistic[] {
  const result = new Map<string, ColorStatistic>()

  for (const cell of cells) {
    const existing = result.get(cell.color.id)

    if (existing) {
      existing.count += 1
      continue
    }

    result.set(cell.color.id, {
      id: cell.color.id,
      name: cell.color.name,
      hex: cell.color.hex,
      count: 1,
    })
  }

  return [...result.values()].sort((a, b) => b.count - a.count)
}
