import type { BeadCell } from '../../engine/grid'
import {
  getRowLabel,
  getTextColor,
} from './PatternUtils'

type DownloadPatternPngOptions = {
  beadGrid: BeadCell[]
  size: number
}

export function downloadPatternPng({
  beadGrid,
  size,
}: DownloadPatternPngOptions) {
  const exportCellSize =
    size <= 29
      ? 48
      : size <= 58
        ? 32
        : size <= 104
          ? 20
          : 12

  const exportCoordinateSize = Math.max(
    38,
    exportCellSize,
  )

  const cellMap = new Map(
    beadGrid.map((cell) => [
      `${cell.x}-${cell.y}`,
      cell,
    ]),
  )

  const canvas = document.createElement('canvas')

  canvas.width =
    exportCoordinateSize +
    size * exportCellSize

  canvas.height =
    exportCoordinateSize +
    size * exportCellSize

  const context = canvas.getContext('2d')

  if (!context) {
    alert('無法建立設計圖。')
    return
  }

  context.imageSmoothingEnabled = false
  context.fillStyle = '#FFFFFF'
  context.fillRect(
    0,
    0,
    canvas.width,
    canvas.height,
  )

  context.fillStyle = '#1F2937'
  context.fillRect(
    0,
    0,
    exportCoordinateSize,
    exportCoordinateSize,
  )

  context.fillStyle = '#FFFFFF'
  context.font =
    `bold ${Math.max(
      10,
      exportCellSize * 0.32,
    )}px Arial`

  context.textAlign = 'center'
  context.textBaseline = 'middle'

  context.fillText(
    '↘',
    exportCoordinateSize / 2,
    exportCoordinateSize / 2,
  )

  for (
    let columnIndex = 0;
    columnIndex < size;
    columnIndex += 1
  ) {
    const left =
      exportCoordinateSize +
      columnIndex * exportCellSize

    context.fillStyle = '#374151'
    context.fillRect(
      left,
      0,
      exportCellSize,
      exportCoordinateSize,
    )

    context.fillStyle = '#FFFFFF'
    context.font =
      `bold ${Math.max(
        8,
        exportCellSize * 0.28,
      )}px Arial`

    context.fillText(
      String(columnIndex + 1),
      left + exportCellSize / 2,
      exportCoordinateSize / 2,
    )
  }

  for (
    let rowIndex = 0;
    rowIndex < size;
    rowIndex += 1
  ) {
    const top =
      exportCoordinateSize +
      rowIndex * exportCellSize

    context.fillStyle = '#374151'
    context.fillRect(
      0,
      top,
      exportCoordinateSize,
      exportCellSize,
    )

    context.fillStyle = '#FFFFFF'
    context.font =
      `bold ${Math.max(
        8,
        exportCellSize * 0.28,
      )}px Arial`

    context.fillText(
      getRowLabel(rowIndex),
      exportCoordinateSize / 2,
      top + exportCellSize / 2,
    )

    for (
      let columnIndex = 0;
      columnIndex < size;
      columnIndex += 1
    ) {
      const cell = cellMap.get(
        `${columnIndex}-${rowIndex}`,
      )

      const left =
        exportCoordinateSize +
        columnIndex * exportCellSize

      context.fillStyle =
        cell?.color.hex ?? '#FFFFFF'

      context.fillRect(
        left,
        top,
        exportCellSize,
        exportCellSize,
      )

      context.strokeStyle = '#9CA3AF'
      context.lineWidth = 1

      context.strokeRect(
        left,
        top,
        exportCellSize,
        exportCellSize,
      )

      if (cell) {
        context.fillStyle =
          getTextColor(cell.color.hex)

        context.font =
          `bold ${Math.max(
            7,
            exportCellSize * 0.25,
          )}px Arial`

        context.fillText(
          cell.color.id,
          left + exportCellSize / 2,
          top + exportCellSize / 2,
        )
      }
    }
  }

  const link = document.createElement('a')

  link.download =
    `beads-pattern-${size}x${size}.png`

  link.href = canvas.toDataURL('image/png')
  link.click()
}