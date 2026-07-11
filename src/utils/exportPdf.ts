import jsPDF from 'jspdf'

interface ExportPdfOptions {
  canvas: HTMLCanvasElement
  size: number
  fileName?: string
}

export function exportBeadPdf({
  canvas,
  size,
  fileName = `beads-studio-${size}x${size}.pdf`,
}: ExportPdfOptions) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const margin = 12
  const titleHeight = 12
  const availableWidth = pageWidth - margin * 2
  const availableHeight = pageHeight - margin * 2 - titleHeight
  const imageSize = Math.min(availableWidth, availableHeight)

  pdf.setFontSize(16)
  pdf.text(`Beads Studio ${size} x ${size}`, margin, margin + 5)

  const imageData = canvas.toDataURL('image/png')

  pdf.addImage(
    imageData,
    'PNG',
    margin,
    margin + titleHeight,
    imageSize,
    imageSize,
  )

  pdf.save(fileName)
}