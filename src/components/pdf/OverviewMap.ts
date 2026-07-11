import type { jsPDF } from 'jspdf'
import type { BeadCell } from '../../engine/grid'
import type { PatternPage } from './PatternPages'

type DrawOverviewMapOptions = {
  pdf: jsPDF
  beadGrid: BeadCell[]
  patternSize: number
  patternPage: PatternPage
  x: number
  y: number
  width?: number
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

export function drawOverviewMap({
  pdf,
  beadGrid,
  patternSize,
  patternPage,
  x,
  y,
  width = 32,
}: DrawOverviewMapOptions) {
  if (beadGrid.length === 0 || patternSize <= 0) {
    return
  }

  const mapSize = width
  const cellSize = mapSize / patternSize

  const cellMap = new Map(
    beadGrid.map((cell) => [
      `${cell.x}-${cell.y}`,
      cell,
    ]),
  )

  // 白色背景與外框
  pdf.setFillColor(255, 255, 255)
  pdf.setDrawColor(156, 163, 175)
  pdf.rect(x, y, mapSize, mapSize, 'FD')

  // 畫整張拼豆縮圖
  for (let row = 0; row < patternSize; row += 1) {
    for (
      let column = 0;
      column < patternSize;
      column += 1
    ) {
      const cell = cellMap.get(`${column}-${row}`)

      if (!cell) {
        continue
      }

      const color = hexToRgb(cell.color.hex)

      pdf.setFillColor(color.r, color.g, color.b)

      pdf.rect(
        x + column * cellSize,
        y + row * cellSize,
        cellSize,
        cellSize,
        'F',
      )
    }
  }

  // 標示目前頁面範圍
  const highlightX =
    x + patternPage.startColumn * cellSize

  const highlightY =
    y + patternPage.startRow * cellSize

  const highlightWidth =
    (patternPage.endColumn -
      patternPage.startColumn) *
    cellSize

  const highlightHeight =
    (patternPage.endRow -
      patternPage.startRow) *
    cellSize

  pdf.setDrawColor(239, 68, 68)
  pdf.setLineWidth(0.8)

  pdf.rect(
    highlightX,
    highlightY,
    highlightWidth,
    highlightHeight,
  )

  // 縮圖標題
  pdf.setTextColor(75, 85, 99)
  pdf.setFontSize(7)

  pdf.text(
    'Overview',
    x + mapSize / 2,
    y - 2,
    { align: 'center' },
  )
}