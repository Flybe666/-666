import type { BeadCell } from './grid'
import type { PaletteColor } from './colorMatcher'
import {
  calculateColorStatistics,
  type ColorStatistic,
} from './statistics'

export type InventoryRecord = Record<string, number>

export type MaterialRow = ColorStatistic & {
  packageSize: number
  requiredPackages: number
  ownedPackages: number
  shortagePackages: number
  estimatedCost: number
}

export function replaceGridColor<TColor extends PaletteColor>(
  grid: readonly BeadCell<TColor>[],
  sourceColorId: string,
  targetColor: TColor,
): BeadCell<TColor>[] {
  if (!sourceColorId || sourceColorId === targetColor.id) {
    return [...grid]
  }

  return grid.map((cell) =>
    cell.color.id === sourceColorId
      ? { ...cell, color: targetColor }
      : cell,
  )
}

export function createMaterialRows(
  statistics: readonly ColorStatistic[],
  packageSize: number,
  packagePrice: number,
  inventory: InventoryRecord,
): MaterialRow[] {
  return statistics.map((item) => {
    const requiredPackages = Math.ceil(item.count / packageSize)
    const ownedPackages = Math.max(0, inventory[item.id] ?? 0)
    const shortagePackages = Math.max(0, requiredPackages - ownedPackages)

    return {
      ...item,
      packageSize,
      requiredPackages,
      ownedPackages,
      shortagePackages,
      estimatedCost: shortagePackages * packagePrice,
    }
  })
}

export function summarizeMaterialRows(rows: readonly MaterialRow[]) {
  return rows.reduce(
    (summary, row) => ({
      totalColors: summary.totalColors + 1,
      totalBeads: summary.totalBeads + row.count,
      requiredPackages: summary.requiredPackages + row.requiredPackages,
      shortagePackages: summary.shortagePackages + row.shortagePackages,
      estimatedCost: summary.estimatedCost + row.estimatedCost,
    }),
    {
      totalColors: 0,
      totalBeads: 0,
      requiredPackages: 0,
      shortagePackages: 0,
      estimatedCost: 0,
    },
  )
}

export function recalculateStatistics<TColor extends PaletteColor>(
  grid: BeadCell<TColor>[],
) {
  return calculateColorStatistics(grid)
}
