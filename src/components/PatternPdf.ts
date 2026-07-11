import { jsPDF } from 'jspdf'
import type { BeadCell } from '../engine/grid'

type ExportPatternPdfOptions = {
  beadGrid: BeadCell[]
  size: number
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

export function exportPatternPdf({
  beadGrid,
  size,
}: ExportPatternPdfOptions) {
  if (beadGrid.length === 0) {
    alert('請先完成圖片轉換。')
    return
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  pdf.setFontSize(20)
  pdf.text('Beads Studio Pattern', 20, 20)

  pdf.setFontSize(11)
  pdf.text(`Pattern size: ${size} x ${size}`, 20, 30)
  pdf.text(`Total beads: ${beadGrid.length}`, 20, 37)

  // 先測試左上角 5×5
  const testSize = size
  const cellSize = 6
  const startX = 20
  const startY = 35

  const cellMap = new Map(
    beadGrid.map((cell) => [`${cell.x}-${cell.y}`, cell]),
  )

  // 上方欄號
  pdf.setFontSize(10)

  for (let x = 0; x < testSize; x += 1) {
    const left = startX + x * cellSize

    pdf.setFillColor(55, 65, 81)
    pdf.setDrawColor(255, 255, 255)
    pdf.rect(left, startY - 10, cellSize, 10, 'FD')

    pdf.setTextColor(255, 255, 255)
    pdf.text(
      String(x + 1),
      left + cellSize / 2,
      startY - 4,
      { align: 'center' },
    )
  }

  // 左側列號與拼豆格
  for (let y = 0; y < testSize; y += 1) {
    const top = startY + y * cellSize

    pdf.setFillColor(55, 65, 81)
    pdf.setDrawColor(255, 255, 255)
    pdf.rect(startX - 10, top, 10, cellSize, 'FD')

    pdf.setTextColor(255, 255, 255)
    pdf.text(
      String.fromCharCode(65 + y),
      startX - 5,
      top + cellSize / 2 + 1.5,
      { align: 'center' },
    )

    for (let x = 0; x < testSize; x += 1) {
      const cell = cellMap.get(`${x}-${y}`)
      const left = startX + x * cellSize

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

      pdf.setFontSize(7)
      pdf.text(
        cell.color.id,
        left + cellSize / 2,
        top + cellSize / 2 + 1,
        { align: 'center' },
      )
    }
  }

  pdf.setTextColor(31, 41, 55)
  pdf.setFontSize(10)
  pdf.text(
    'Test preview: top-left 5 x 5 cells',
    startX,
    startY + testSize * cellSize + 10,
  )
// 建立顏色統計
const colorSummary = new Map<
  string,
  {
    id: string
    name: string
    hex: string
    count: number
  }
>()

for (const cell of beadGrid) {
  const existing = colorSummary.get(cell.color.id)

  if (existing) {
    existing.count += 1
  } else {
    colorSummary.set(cell.color.id, {
      id: cell.color.id,
      name: cell.color.name,
      hex: cell.color.hex,
      count: 1,
    })
  }
}

const summaryItems = [...colorSummary.values()].sort((a, b) =>
  a.id.localeCompare(b.id, undefined, { numeric: true }),
)

// 新增色號統計頁
pdf.addPage()

pdf.setTextColor(31, 41, 55)
pdf.setFontSize(20)
pdf.text('Color Summary', 20, 20)

pdf.setFontSize(11)
pdf.text(`Pattern size: ${size} x ${size}`, 20, 30)
pdf.text(`Total beads: ${beadGrid.length}`, 20, 37)
pdf.text(`Colors used: ${summaryItems.length}`, 20, 44)

const pageHeight = pdf.internal.pageSize.getHeight()
const rowHeight = 10
const startSummaryY = 58

let summaryY = startSummaryY

for (const item of summaryItems) {
  // 空間不足時自動新增統計頁
  if (summaryY + rowHeight > pageHeight - 15) {
    pdf.addPage()

    pdf.setTextColor(31, 41, 55)
    pdf.setFontSize(18)
    pdf.text('Color Summary - Continued', 20, 20)

    summaryY = 35
  }

  const rgb = hexToRgb(item.hex)

  // 顏色色塊
  pdf.setFillColor(rgb.r, rgb.g, rgb.b)
  pdf.setDrawColor(156, 163, 175)
  pdf.rect(20, summaryY - 5.5, 7, 7, 'FD')

  // 色號
  pdf.setTextColor(31, 41, 55)
  pdf.setFontSize(10)
  pdf.text(item.id, 32, summaryY)

  // 顏色名稱
  pdf.text(item.name, 52, summaryY)

  // 顆數
  pdf.text(
    `${item.count} beads`,
    185,
    summaryY,
    { align: 'right' },
  )

  // 分隔線
  pdf.setDrawColor(229, 231, 235)
  pdf.line(20, summaryY + 3, 190, summaryY + 3)

  summaryY += rowHeight
}
  pdf.save(`beads-pattern-${size}x${size}.pdf`)
}