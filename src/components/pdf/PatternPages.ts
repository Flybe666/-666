export interface PatternPage {
  pageNumber: number

  startRow: number
  endRow: number

  startColumn: number
  endColumn: number

  rowPage: number
  columnPage: number
}

export function splitIntoPages(
  totalRows: number,
  totalColumns: number,
  rowsPerPage: number,
  columnsPerPage: number,
): PatternPage[] {
  const pages: PatternPage[] = []

  let pageNumber = 1
  let rowPage = 1

  for (
    let startRow = 0;
    startRow < totalRows;
    startRow += rowsPerPage
  ) {
    let columnPage = 1

    for (
      let startColumn = 0;
      startColumn < totalColumns;
      startColumn += columnsPerPage
    ) {
      pages.push({
        pageNumber,

        startRow,
        endRow: Math.min(
          startRow + rowsPerPage,
          totalRows,
        ),

        startColumn,
        endColumn: Math.min(
          startColumn + columnsPerPage,
          totalColumns,
        ),

        rowPage,
        columnPage,
      })

      pageNumber += 1
      columnPage += 1
    }

    rowPage += 1
  }

  return pages
}