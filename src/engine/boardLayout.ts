import type { BoardSection } from '../types/board'

export function createBoardLayout(
  patternSize: number,
  boardSize: number,
): BoardSection[] {
  const boards: BoardSection[] = []

  const rows = Math.ceil(patternSize / boardSize)
  const columns = Math.ceil(patternSize / boardSize)

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      boards.push({
        id: `${String.fromCharCode(65 + row)}${column + 1}`,

        row,
        column,

        startRow: row * boardSize,
        endRow: Math.min(
          (row + 1) * boardSize,
          patternSize,
        ),

        startColumn: column * boardSize,
        endColumn: Math.min(
          (column + 1) * boardSize,
          patternSize,
        ),
      })
    }
  }

  return boards
}