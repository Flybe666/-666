export type PdfPaperSize = 'a4' | 'a3'

export type PdfSettings = {
  cellsPerPage: number
  paperSize: PdfPaperSize
  showOverview: boolean
  showPageMaterials: boolean
  showNavigation: boolean
  showColorId: boolean
  showColorName: boolean
}

export const defaultPdfSettings: PdfSettings = {
  cellsPerPage: 25,
  paperSize: 'a4',
  showOverview: true,
  showPageMaterials: true,
  showNavigation: true,
  showColorId: true,
  showColorName: false,
}