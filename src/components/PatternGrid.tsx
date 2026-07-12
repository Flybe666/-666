import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MouseEvent,
  type SetStateAction,
} from 'react'

import type { BeadCell } from '../engine/grid'
import type { BoardSection } from '../types/board'
import { downloadPatternPng } from './pattern/PatternExport'
import {
  getRowLabel,
  getTextColor,
} from './pattern/PatternUtils'

type PatternGridProps = {
  beadGrid: BeadCell[]
  size: number
  hoveredColorId: string | null
  lockedColorId: string | null
  onHoverColor: (colorId: string | null) => void
  onLockColor: (colorId: string | null) => void
  selectedBoard: BoardSection | null
  zoom: number
  setZoom: Dispatch<SetStateAction<number>>
}

export default function PatternGrid({
  beadGrid,
  size,
  hoveredColorId,
  lockedColorId,
  onHoverColor,
  onLockColor,
  selectedBoard,
  zoom,
  setZoom,
}: PatternGridProps) {
  const activeColorId = lockedColorId ?? hoveredColorId
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const scrollStartRef = useRef({ left: 0, top: 0 })
  const hasDraggedRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  const cellSize = size <= 29 ? 34 : size <= 58 ? 28 : 24
  const coordinateSize = 34
  const gridBaseWidth = coordinateSize + size * cellSize + size
  const gridBaseHeight = coordinateSize + size * cellSize + size
useEffect(() => {
  const container =
    scrollContainerRef.current

  if (!container || !selectedBoard) {
    return
  }

  container.scrollTo({
    left:
      selectedBoard.startColumn *
      (cellSize + 1) *
      zoom,

    top:
      selectedBoard.startRow *
      (cellSize + 1) *
      zoom,

    behavior: 'smooth',
  })
}, [
  selectedBoard,
  cellSize,
  zoom,
])
useEffect(() => {
  const container =
    scrollContainerRef.current

  if (!container) {
    return
  }

  const activeContainer = container

  function handleNativeWheel(
    event: WheelEvent,
  ) {
    event.preventDefault()

    const rect =
      activeContainer.getBoundingClientRect()

    const mouseX =
      event.clientX - rect.left

    const mouseY =
      event.clientY - rect.top

    const previousScrollLeft =
      activeContainer.scrollLeft

    const previousScrollTop =
      activeContainer.scrollTop

    setZoom((current) => {
      const direction =
        event.deltaY < 0 ? 0.1 : -0.1

      const next = Math.min(
        4,
        Math.max(
          0.25,
          Number(
            (current + direction).toFixed(2),
          ),
        ),
      )

      if (next === current) {
        return current
      }

      const scale = next / current

      requestAnimationFrame(() => {
        activeContainer.scrollLeft =
          (previousScrollLeft + mouseX) *
            scale -
          mouseX

        activeContainer.scrollTop =
          (previousScrollTop + mouseY) *
            scale -
          mouseY
      })

      return next
    })
  }

  activeContainer.addEventListener(
    'wheel',
    handleNativeWheel,
    { passive: false },
  )

  return () => {
    activeContainer.removeEventListener(
      'wheel',
      handleNativeWheel,
    )
  }
}, [setZoom])
  if (beadGrid.length === 0) {
    return null
  }

  const cellMap = new Map(
    beadGrid.map((cell) => [`${cell.x}-${cell.y}`, cell]),
  )

function handleMouseDown(
  event: MouseEvent<HTMLDivElement>,
) {
  const container =
    scrollContainerRef.current

  if (!container) {
    return
  }

  setIsDragging(true)
  hasDraggedRef.current = false

  dragStartRef.current = {
    x: event.clientX,
    y: event.clientY,
  }

  scrollStartRef.current = {
    left: container.scrollLeft,
    top: container.scrollTop,
  }
}
  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const container = scrollContainerRef.current

    if (!isDragging || !container) {
      return
    }

    const dx = event.clientX - dragStartRef.current.x
    const dy = event.clientY - dragStartRef.current.y

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasDraggedRef.current = true
    }

    container.scrollLeft = scrollStartRef.current.left - dx
    container.scrollTop = scrollStartRef.current.top - dy
  }

  function handleMouseUp() {
    setIsDragging(false)
  }

  function handleCellClick(cell?: BeadCell) {
    if (!cell) {
      return
    }

    if (hasDraggedRef.current) {
      hasDraggedRef.current = false
      return
    }

    onLockColor(
      lockedColorId === cell.color.id ? null : cell.color.id,
    )
    onHoverColor(null)
  }

  function clearHighlight() {
    onHoverColor(null)
    onLockColor(null)
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

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-violet-700">
              目前高亮：{activeColorId ?? '無'}
              {lockedColorId ? '（已鎖定）' : ''}
            </p>

            {activeColorId && (
              <button
                type="button"
                onClick={clearHighlight}
                className="rounded-lg bg-violet-100 px-2 py-1 text-xs font-bold text-violet-700 hover:bg-violet-200"
              >
                解除高亮
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
            每格顯示色號
          </span>

          <button
            type="button"
            onClick={() => downloadPatternPng({ beadGrid, size })}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700"
          >
            下載設計圖 PNG
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="max-h-[650px] overflow-auto rounded-2xl border border-gray-300 bg-gray-100 p-3"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: `${gridBaseWidth * zoom}px`,
            height: `${gridBaseHeight * zoom}px`,
          }}
        >
          <div
            className="grid w-max"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
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

            {Array.from({ length: size }, (_, columnIndex) => (
              <div
                key={`column-${columnIndex}`}
                className="sticky top-0 z-20 flex items-center justify-center bg-gray-700 text-[10px] font-bold text-white"
              >
                {columnIndex + 1}
              </div>
            ))}

            {Array.from({ length: size }, (_, rowIndex) => (
              <div key={`row-${rowIndex}`} className="contents">
                <div className="sticky left-0 z-10 flex items-center justify-center bg-gray-700 text-[10px] font-bold text-white">
                  {getRowLabel(rowIndex)}
                </div>

                {Array.from({ length: size }, (_, columnIndex) => {
                  const cell = cellMap.get(
                    `${columnIndex}-${rowIndex}`,
                  )

                  const isActive =
                    Boolean(activeColorId) &&
                    cell?.color.id === activeColorId

                  const isDimmed =
                    Boolean(activeColorId) &&
                    cell?.color.id !== activeColorId

                  const isSelectedBoard =
                    selectedBoard !== null &&
                    rowIndex >= selectedBoard.startRow &&
                    rowIndex < selectedBoard.endRow &&
                    columnIndex >= selectedBoard.startColumn &&
                    columnIndex < selectedBoard.endColumn

                  return (
                    <div
                      key={`${columnIndex}-${rowIndex}`}
                      title={
                        cell
                          ? `座標：${getRowLabel(rowIndex)}${columnIndex + 1}｜${cell.color.id} ${cell.color.name}`
                          : `座標：${getRowLabel(rowIndex)}${columnIndex + 1}`
                      }
                      onMouseEnter={() => {
                        if (!lockedColorId && !isDragging) {
                          onHoverColor(cell?.color.id ?? null)
                        }
                      }}
                      onMouseLeave={() => {
                        if (!lockedColorId && !isDragging) {
                          onHoverColor(null)
                        }
                      }}
                      onClick={() => handleCellClick(cell)}
                      className={`flex cursor-pointer select-none items-center justify-center overflow-hidden text-[8px] font-bold leading-none transition-opacity duration-150 ${
                        isDimmed ? 'opacity-20' : 'opacity-100'
                      }`}
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                        backgroundColor: cell?.color.hex ?? '#FFFFFF',
                        color: cell
                          ? getTextColor(cell.color.hex)
                          : '#111827',
                        boxShadow: [
                          isActive
                            ? 'inset 0 0 0 2px #7C3AED'
                            : null,
                          isSelectedBoard
                            ? 'inset 0 0 0 9999px rgba(124,58,237,0.12)'
                            : null,
                        ]
                          .filter(Boolean)
                          .join(', '),
                        position: 'relative',
                        zIndex: isActive ? 2 : 1,
                        borderTop:
                          rowIndex % 29 === 0
                            ? '2px solid #111827'
                            : undefined,
                        borderLeft:
                          columnIndex % 29 === 0
                            ? '2px solid #111827'
                            : undefined,
                        borderRight:
                          columnIndex === size - 1
                            ? '2px solid #111827'
                            : undefined,
                        borderBottom:
                          rowIndex === size - 1
                            ? '2px solid #111827'
                            : undefined,
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
      </div>

      <p className="mt-3 text-sm text-gray-500">
        滾動滑鼠滾輪可縮放；按住滑鼠拖曳可移動畫布。滑鼠移到格子可暫時高亮同色，點擊格子可鎖定高亮。
      </p>
    </section>
  )
}