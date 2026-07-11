export interface PatternPage {
  startRow: number
  endRow: number
  pageNumber: number
}
export function splitIntoPages(
  totalRows: number,
  rowsPerPage: number,
): PatternPage[] {
  const pages: PatternPage[] = []

  let page = 1

  for (let row = 0; row < totalRows; row += rowsPerPage) {
    pages.push({
      startRow: row,
      endRow: Math.min(row + rowsPerPage, totalRows),
      pageNumber: page++,
    })
  }

  return pages
}