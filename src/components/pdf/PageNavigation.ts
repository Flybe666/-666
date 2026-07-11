import type { jsPDF } from 'jspdf'
import type { PatternPage } from './PatternPages'

type DrawPageNavigationOptions = {
  pdf: jsPDF
  pages: PatternPage[]
  patternPage: PatternPage
  pageWidth: number
  pageHeight: number
  margin: number
}

export function drawPageNavigation({
  pdf,
  pages,
  patternPage,
  pageWidth,
  pageHeight,
  margin,
}: DrawPageNavigationOptions) {
  const topPage = pages.find(
    (page) =>
      page.rowPage === patternPage.rowPage - 1 &&
      page.columnPage === patternPage.columnPage,
  )

  const bottomPage = pages.find(
    (page) =>
      page.rowPage === patternPage.rowPage + 1 &&
      page.columnPage === patternPage.columnPage,
  )

  const leftPage = pages.find(
    (page) =>
      page.rowPage === patternPage.rowPage &&
      page.columnPage === patternPage.columnPage - 1,
  )

  const rightPage = pages.find(
    (page) =>
      page.rowPage === patternPage.rowPage &&
      page.columnPage === patternPage.columnPage + 1,
  )

  pdf.setTextColor(75, 85, 99)
  pdf.setFontSize(8)

  if (topPage) {
    pdf.text(
      `Up: Page ${topPage.pageNumber}`,
      pageWidth / 2,
      margin - 3,
      { align: 'center' },
    )
  }

  if (bottomPage) {
    pdf.text(
      `Down: Page ${bottomPage.pageNumber}`,
      pageWidth / 2,
      pageHeight - margin + 5,
      { align: 'center' },
    )
  }

  if (leftPage) {
    pdf.text(
      `Left: Page ${leftPage.pageNumber}`,
      margin,
      pageHeight - margin,
    )
  }

  if (rightPage) {
    pdf.text(
      `Right: Page ${rightPage.pageNumber}`,
      pageWidth - margin,
      pageHeight - margin,
      { align: 'right' },
    )
  }
}