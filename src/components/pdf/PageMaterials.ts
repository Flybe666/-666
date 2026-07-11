import type { jsPDF } from 'jspdf'
import type { BeadCell } from '../../engine/grid'
import type { PatternPage } from './PatternPages'

type DrawPageMaterialsOptions = {
  pdf: jsPDF
  beadGrid: BeadCell[]
  patternPage: PatternPage
  x: number
  y: number
  width?: number
}

type MaterialItem = {
  id: string
  name: string
  hex: string
  count: number
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

export function drawPageMaterials({
  pdf,
  beadGrid,
  patternPage,
  x,
  y,
  width = 145,
}: DrawPageMaterialsOptions) {
  const summary = new Map<string, MaterialItem>()

  for (const cell of beadGrid) {
    const isInsidePage =
      cell.x >= patternPage.startColumn &&
      cell.x < patternPage.endColumn &&
      cell.y >= patternPage.startRow &&
      cell.y < patternPage.endRow

    if (!isInsidePage) continue

    const existing = summary.get(cell.color.id)

    if (existing) {
      existing.count += 1
    } else {
      summary.set(cell.color.id, {
        id: cell.color.id,
        name: cell.color.name,
        hex: cell.color.hex,
        count: 1,
      })
    }
  }

  const items = [...summary.values()].sort(
    (a, b) => b.count - a.count,
  )

  pdf.setTextColor(31, 41, 55)
  pdf.setFontSize(8)
  pdf.text('Page Materials', x, y)

  const columns = 5
  const itemWidth = width / columns
  const rowHeight = 7
  const startY = y + 6

  items.forEach((item, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)

    const itemX = x + column * itemWidth
    const itemY = startY + row * rowHeight

    const color = hexToRgb(item.hex)

    pdf.setFillColor(color.r, color.g, color.b)
    pdf.setDrawColor(156, 163, 175)
    pdf.rect(itemX, itemY - 3.5, 4, 4, 'FD')

    pdf.setTextColor(31, 41, 55)
    pdf.setFontSize(6.5)

    pdf.text(item.id, itemX + 6, itemY)

    pdf.text(
      `×${item.count}`,
      itemX + itemWidth - 2,
      itemY,
      { align: 'right' },
    )
  })
}