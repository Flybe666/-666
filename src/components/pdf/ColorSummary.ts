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

  const summaryItems = [...summaryMap.values()].sort(
    (a, b) => b.count - a.count,
  )

  const totalBeads = beadGrid.length
  const beadsPerBag = 1000

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const margin = 18
  const rowHeight = 11

  const colorX = margin
  const idX = margin + 12
  const nameX = margin + 34
  const countX = pageWidth - 70
  const percentX = pageWidth - 42
  const bagsX = pageWidth - margin

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

    y += 6

    pdf.text(
      `Total beads: ${totalBeads}`,
      margin,
      y,
    )

    y += 6

    pdf.text(
      `Colors used: ${summaryItems.length}`,
      margin,
      y,
    )

    y += 6

    pdf.text(
      `Bag estimate: ${beadsPerBag} beads per bag`,
      margin,
      y,
    )

    y += 12

    pdf.setFillColor(243, 244, 246)
    pdf.setDrawColor(209, 213, 219)

    pdf.rect(
      margin,
      y - 6,
      pageWidth - margin * 2,
      9,
      'FD',
    )

    pdf.setTextColor(55, 65, 81)
    pdf.setFontSize(9)

    pdf.text('Color', colorX, y)
    pdf.text('ID', idX, y)
    pdf.text('Name', nameX, y)
    pdf.text('Count', countX, y, { align: 'right' })
    pdf.text('Usage', percentX, y, { align: 'right' })
    pdf.text('Bags', bagsX, y, { align: 'right' })

    y += 10
  }

  drawHeader('Materials List')

  for (const item of summaryItems) {
    if (y + rowHeight > pageHeight - margin) {
      pdf.addPage()
      y = 22
      drawHeader('Materials List - Continued')
    }

    const color = hexToRgb(item.hex)
    const percentage =
      totalBeads > 0
        ? (item.count / totalBeads) * 100
        : 0
    const estimatedBags = Math.ceil(
      item.count / beadsPerBag,
    )

    pdf.setFillColor(color.r, color.g, color.b)
    pdf.setDrawColor(156, 163, 175)

    pdf.rect(
      colorX,
      y - 5.5,
      7,
      7,
      'FD',
    )

    pdf.setTextColor(31, 41, 55)
    pdf.setFontSize(9)

    pdf.text(item.id, idX, y)
    pdf.text(item.name, nameX, y)

    pdf.text(
      item.count.toLocaleString(),
      countX,
      y,
      { align: 'right' },
    )

    pdf.text(
      `${percentage.toFixed(1)}%`,
      percentX,
      y,
      { align: 'right' },
    )

    pdf.text(
      `${estimatedBags}`,
      bagsX,
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

  y += 5

  if (y + 28 > pageHeight - margin) {
    pdf.addPage()
    y = 22
  }

  const totalEstimatedBags = summaryItems.reduce(
    (total, item) =>
      total + Math.ceil(item.count / beadsPerBag),
    0,
  )

  pdf.setFillColor(245, 243, 255)
  pdf.setDrawColor(196, 181, 253)

  pdf.rect(
    margin,
    y,
    pageWidth - margin * 2,
    24,
    'FD',
  )

  pdf.setTextColor(76, 29, 149)
  pdf.setFontSize(11)

  pdf.text(
    `Total beads: ${totalBeads.toLocaleString()}`,
    margin + 6,
    y + 8,
  )

  pdf.text(
    `Total colors: ${summaryItems.length}`,
    margin + 6,
    y + 15,
  )

  pdf.text(
    `Estimated bags: ${totalEstimatedBags}`,
    pageWidth - margin - 6,
    y + 11,
    { align: 'right' },
  )
}