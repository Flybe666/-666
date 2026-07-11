import type { jsPDF } from 'jspdf'
import type { BeadCell } from '../../engine/grid'
import type { PatternPage } from './PatternPages'

type DrawPatternPageOptions = {
  pdf: jsPDF
  beadGrid: BeadCell[]
  patternPage: PatternPage
  totalPatternPages: number
  patternSize: number
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

function getTextColor(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const brightness = r * 0.299 + g * 0.587 + b * 0.114

  return brightness > 160
    ? { r: 17, g: 24, b: 39 }
    : { r: 255, g: 255, b: 255 }
}

function getRowLabel(index: number) {
  let value = index + 1
  let label = ''

  while (value > 0) {
    value -= 1
    label =
      String.fromCharCode(65 + (value % 26)) + label
    value = Math.floor(value / 26)
  }

  return label
}

export function drawPatternPage({
  pdf,
  beadGrid,
  patternPage,
  totalPatternPages,
  patternSize,
}: DrawPatternPageOptions) {
  const {
    pageNumber,
    startRow,
    endRow,
    startColumn,
    endColumn,
  } = patternPage

  const rowsOnPage = endRow - startRow
  const columnsOnPage = endColumn - startColumn

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const margin = 12
  const titleAreaHeight = 25
  const footerHeight = 12
  const coordinateSize = 8

  const availableWidth =
    pageWidth - margin * 2 - coordinateSize

  const availableHeight =
    pageHeight -
    margin * 2 -
    titleAreaHeight -
    footerHeight -
    coordinateSize

  const cellSize = Math.min(
    availableWidth / columnsOnPage,
    availableHeight / rowsOnPage,
  )

  const gridWidth =
    coordinateSize + columnsOnPage * cellSize

  const gridHeight =
    coordinateSize + rowsOnPage * cellSize

  const startX = (pageWidth - gridWidth) / 2
  const startY = margin + titleAreaHeight

  const cellMap = new Map(
    beadGrid.map((cell) => [
      `${cell.x}-${cell.y}`,
      cell,
    ]),
  )

  // 頁面標題
  pdf.setTextColor(31, 41, 55)
  pdf.setFontSize(16)
  pdf.text('Beads Studio Pattern', margin, margin + 5)

  pdf.setFontSize(9)
  pdf.text(
    `Pattern: ${patternSize} x ${patternSize}`,
    margin,
    margin + 13,
  )

  pdf.text(
    `Rows ${startRow + 1}-${endRow} | Columns ${startColumn + 1}-${endColumn}`,
    margin,
    margin + 19,
  )

  pdf.text(
    `Page ${pageNumber} / ${totalPatternPages}`,
    pageWidth - margin,
    margin + 5,
    { align: 'right' },
  )

  // 左上角
  pdf.setFillColor(31, 41, 55)
  pdf.setDrawColor(255, 255, 255)

  pdf.rect(
    startX,
    startY,
    coordinateSize,
    coordinateSize,
    'FD',
  )

  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(7)

  pdf.text(
    '↘',
    startX + coordinateSize / 2,
    startY + coordinateSize / 2 + 1,
    { align: 'center' },
  )

  // 上方欄號
  for (
    let column = startColumn;
    column < endColumn;
    column += 1
  ) {
    const relativeColumn = column - startColumn

    const left =
      startX +
      coordinateSize +
      relativeColumn * cellSize

    pdf.setFillColor(55, 65, 81)
    pdf.setDrawColor(255, 255, 255)

    pdf.rect(
      left,
      startY,
      cellSize,
      coordinateSize,
      'FD',
    )

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(Math.max(5, cellSize * 0.28))

    pdf.text(
      String(column + 1),
      left + cellSize / 2,
      startY + coordinateSize / 2 + 1,
      { align: 'center' },
    )
  }

  // 左側列號與拼豆格
  for (
    let row = startRow;
    row < endRow;
    row += 1
  ) {
    const relativeRow = row - startRow

    const top =
      startY +
      coordinateSize +
      relativeRow * cellSize

    pdf.setFillColor(55, 65, 81)
    pdf.setDrawColor(255, 255, 255)

    pdf.rect(
      startX,
      top,
      coordinateSize,
      cellSize,
      'FD',
    )

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(Math.max(5, cellSize * 0.28))

    pdf.text(
      getRowLabel(row),
      startX + coordinateSize / 2,
      top + cellSize / 2 + 1,
      { align: 'center' },
    )

    for (
      let column = startColumn;
      column < endColumn;
      column += 1
    ) {
      const relativeColumn =
        column - startColumn

      const left =
        startX +
        coordinateSize +
        relativeColumn * cellSize

      const cell =
        cellMap.get(`${column}-${row}`)

      if (!cell) {
        pdf.setFillColor(255, 255, 255)
        pdf.setDrawColor(156, 163, 175)
        pdf.rect(left, top, cellSize, cellSize, 'FD')
        continue
      }

      const background = hexToRgb(cell.color.hex)
      const textColor = getTextColor(cell.color.hex)

      pdf.setFillColor(
        background.r,
        background.g,
        background.b,
      )

      pdf.setDrawColor(156, 163, 175)
      pdf.rect(left, top, cellSize, cellSize, 'FD')

      pdf.setTextColor(
        textColor.r,
        textColor.g,
        textColor.b,
      )

      pdf.setFontSize(Math.max(4, cellSize * 0.22))

      pdf.text(
        cell.color.id,
        left + cellSize / 2,
        top + cellSize / 2 + 0.8,
        { align: 'center' },
      )
    }
  }

  // 頁尾
  pdf.setTextColor(107, 114, 128)
  pdf.setFontSize(8)

  pdf.text(
    `Section: row page ${patternPage.rowPage}, column page ${patternPage.columnPage}`,
    pageWidth / 2,
    pageHeight - margin,
    { align: 'center' },
  )

  // 外框
  pdf.setDrawColor(75, 85, 99)
  pdf.setLineWidth(0.4)

  pdf.rect(
    startX,
    startY,
    gridWidth,
    gridHeight,
  )
}