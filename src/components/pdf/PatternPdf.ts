import { jsPDF } from 'jspdf'
import type { BeadCell } from '../../engine/grid'
import { splitIntoPages } from './PatternPages'
import { drawPatternPage } from './PdfGrid'
import { drawColorSummary } from './ColorSummary'
import { drawCoverPage } from './CoverPage'
type ExportPatternPdfOptions = {
  beadGrid: BeadCell[]
  size: number
}

export function exportPatternPdf({
  beadGrid,
  size,
}: ExportPatternPdfOptions) {
  if (beadGrid.length === 0) {
    alert('請先完成圖片轉換。')
   return
}

const pages = splitIntoPages(
  size,
  size,
  25,
  25,
)

const pdf = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
})

drawCoverPage({
  pdf,
  beadGrid,
  patternSize: size,
  patternPages: pages.length,
})

pdf.addPage()

pages.forEach((page, index) => {
  if (index > 0) {
    pdf.addPage()
  }

    drawPatternPage({
      pdf,
      beadGrid,
      patternPage: page,
      totalPatternPages: pages.length,
      patternSize: size,
    })
  })

  pdf.addPage()

  drawColorSummary({
    pdf,
    beadGrid,
    patternSize: size,
  })

  pdf.save(`beads-pattern-${size}x${size}.pdf`)
}