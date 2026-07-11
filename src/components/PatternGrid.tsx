import type { BeadCell } from '../engine/grid'

type PatternGridProps = {
  beadGrid: BeadCell[]
  size: number
}

function getTextColor(hex: string) {
  const normalized = hex.replace('#', '')

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  const brightness =
    red * 0.299 +
    green * 0.587 +
    blue * 0.114

  return brightness > 160 ? '#111827' : '#FFFFFF'
}

function getRowLabel(index: number) {
  let value = index + 1
  let label = ''

  while (value > 0) {
    value -= 1
    label = String.fromCharCode(65 + (value % 26)) + label
    value = Math.floor(value / 26)
  }

  return label
}

export default function PatternGrid({
  beadGrid,
  size,
}: PatternGridProps) {
  if (beadGrid.length === 0) {
    return null
  }

  const cellSize = size <= 29 ? 34 : size <= 58 ? 28 : 24
  const coordinateSize = 34

  const cellMap = new Map(
    beadGrid.map((cell) => [`${cell.x}-${cell.y}`, cell]),
  )

  function downloadPatternPng() {
    const exportCellSize =
      size <= 29 ? 48 :
      size <= 58 ? 32 :
      size <= 104 ? 20 :
      12

    const exportCoordinateSize = Math.max(38, exportCellSize)
    const canvas = document.createElement('canvas')

    canvas.width =
      exportCoordinateSize + size * exportCellSize

    canvas.height =
      exportCoordinateSize + size * exportCellSize

    const context = canvas.getContext('2d')

    if (!context) {
      alert('無法建立設計圖。')
      return
    }

    context.imageSmoothingEnabled = false
    context.fillStyle = '#FFFFFF'
    context.fillRect(0, 0, canvas.width, canvas.height)

    // 左上角
    context.fillStyle = '#1F2937'
    context.fillRect(
      0,
      0,
      exportCoordinateSize,
      exportCoordinateSize,
    )

    context.fillStyle = '#FFFFFF'
    context.font = `bold ${Math.max(10, exportCellSize * 0.32)}px Arial`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(
      '↘',
      exportCoordinateSize / 2,
      exportCoordinateSize / 2,
    )

    // 上方欄號
    for (let x = 0; x < size; x += 1) {
      const left =
        exportCoordinateSize + x * exportCellSize

      context.fillStyle = '#374151'
      context.fillRect(
        left,
        0,
        exportCellSize,
        exportCoordinateSize,
      )

      context.fillStyle = '#FFFFFF'
      context.font =
        `bold ${Math.max(8, exportCellSize * 0.28)}px Arial`

      context.fillText(
        String(x + 1),
        left + exportCellSize / 2,
        exportCoordinateSize / 2,
      )
    }

    // 左側列號與拼豆格
    for (let y = 0; y < size; y += 1) {
      const top =
        exportCoordinateSize + y * exportCellSize

      context.fillStyle = '#374151'
      context.fillRect(
        0,
        top,
        exportCoordinateSize,
        exportCellSize,
      )

      context.fillStyle = '#FFFFFF'
      context.font =
        `bold ${Math.max(8, exportCellSize * 0.28)}px Arial`

      context.fillText(
        getRowLabel(y),
        exportCoordinateSize / 2,
        top + exportCellSize / 2,
      )

      for (let x = 0; x < size; x += 1) {
        const cell = cellMap.get(`${x}-${y}`)

        const left =
          exportCoordinateSize + x * exportCellSize

        context.fillStyle = cell?.color.hex ?? '#FFFFFF'
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
          context.fillStyle = getTextColor(cell.color.hex)
          context.font =
            `bold ${Math.max(7, exportCellSize * 0.25)}px Arial`

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

  return (
    <section className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            拼豆設計圖
          </h2>

          <p className="text-sm text-gray-500">
            共 {beadGrid.length} 格（{size} × {size}）
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
            每格顯示色號
          </span>

          <button
            type="button"
            onClick={downloadPatternPng}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700"
          >
            下載設計圖 PNG
          </button>
        </div>
      </div>

      <div className="max-h-[650px] overflow-auto rounded-2xl border border-gray-300 bg-gray-100 p-3">
        <div
          className="grid w-max"
          style={{
            gridTemplateColumns:
              `${coordinateSize}px repeat(${size}, ${cellSize}px)`,
            gridTemplateRows:
              `${coordinateSize}px repeat(${size}, ${cellSize}px)`,
            gap: '1px',
          }}
        >
          <div className="sticky left-0 top-0 z-30 flex items-center justify-center bg-gray-800 text-xs font-bold text-white">
            ↘
          </div>

          {Array.from({ length: size }, (_, index) => (
            <div
              key={`column-${index}`}
              className="sticky top-0 z-20 flex items-center justify-center bg-gray-700 text-[10px] font-bold text-white"
            >
              {index + 1}
            </div>
          ))}

          {Array.from({ length: size }, (_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="contents"
            >
              <div className="sticky left-0 z-10 flex items-center justify-center bg-gray-700 text-[10px] font-bold text-white">
                {getRowLabel(rowIndex)}
              </div>

              {Array.from({ length: size }, (_, columnIndex) => {
                const cell =
                  cellMap.get(`${columnIndex}-${rowIndex}`)

                return (
                  <div
                    key={`${columnIndex}-${rowIndex}`}
                    title={
                      cell
                        ? `座標：${getRowLabel(rowIndex)}${columnIndex + 1}｜${cell.color.id} ${cell.color.name}`
                        : `座標：${getRowLabel(rowIndex)}${columnIndex + 1}`
                    }
                    className="flex select-none items-center justify-center overflow-hidden text-[8px] font-bold leading-none"
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      backgroundColor:
                        cell?.color.hex ?? '#FFFFFF',
                      color: cell
                        ? getTextColor(cell.color.hex)
                        : '#111827',
                    }}
                  >
                    {cell?.color.id ?? ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-500">
        上方是欄號，左側是列號。滑鼠停在格子上可查看座標、色號與顏色名稱。
      </p>
    </section>
  )
}