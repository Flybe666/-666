import type { jsPDF } from 'jspdf'
import type { BeadCell } from '../../engine/grid'

type DrawColorSummaryOptions = {
  pdf: jsPDF
  beadGrid: BeadCell[]
  patternSize: number
}

type ColorSummaryItem = {
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

export function drawColorSummary({
  pdf,
  beadGrid,
  patternSize,
}: DrawColorSummaryOptions) {
  const summaryMap = new Map<string, ColorSummaryItem>()

  for (const cell of beadGrid) {
    const existing = summaryMap.get(cell.color.id)

    if (existing) {
      existing.count += 1
    } else {
      summaryMap.set(cell.color.id, {
        id: cell.color.id,
        name: cell.color.name,
        hex: cell.color.hex,
        count: 1,
      })
    }
  }

  const summaryItems = [...summaryMap.values()].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, {
      numeric: true,
    }),
  )

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const margin = 18
  const rowHeight = 10

  let y = 22

  function drawHeader(title: string) {
    pdf.setTextColor(31, 41, 55)
    pdf.setFontSize(20)
    pdf.text(title, margin, y)

    y += 11

    pdf.setFontSize(10)
    pdf.text(
      `Pattern size: ${patternSize} x ${patternSize}`,
      margin,
      y,
    )

    y += 7

    pdf.text(
      `Total beads: ${beadGrid.length}`,
      margin,
      y,
    )

    y += 7

    pdf.text(
      `Colors used: ${summaryItems.length}`,
      margin,
      y,
    )

    y += 12
  }

  drawHeader('Color Summary')

  for (const item of summaryItems) {
    if (y + rowHeight > pageHeight - margin) {
      pdf.addPage()
      y = 22
      drawHeader('Color Summary - Continued')
    }

    const color = hexToRgb(item.hex)

    pdf.setFillColor(color.r, color.g, color.b)
    pdf.setDrawColor(156, 163, 175)
    pdf.rect(
      margin,
      y - 5.5,
      7,
      7,
      'FD',
    )

    pdf.setTextColor(31, 41, 55)
    pdf.setFontSize(10)

    pdf.text(
      item.id,
      margin + 12,
      y,
    )

    pdf.text(
      item.name,
      margin + 34,
      y,
    )

    pdf.text(
      `${item.count} beads`,
      pageWidth - margin,
      y,
      { align: 'right' },
    )

    pdf.setDrawColor(229, 231, 235)
    pdf.line(
      margin,
      y + 3,
      pageWidth - margin,
      y + 3,
    )

    y += rowHeight
  }
}