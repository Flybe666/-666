import type { BeadCell } from '../../engine/grid'

type PatternMiniMapProps = {
  beadGrid: BeadCell[]
  size: number
  viewport: {
    scrollLeft: number
    scrollTop: number
    clientWidth: number
    clientHeight: number
  }
  onNavigate: (
    xRatio: number,
    yRatio: number,
  ) => void
}

export default function PatternMiniMap({
  beadGrid,
  size,
  viewport,
  onNavigate,
}: PatternMiniMapProps) {
  const mapSize = 180
  const pixel = mapSize / size

  const totalDisplayWidth = mapSize
  const totalDisplayHeight = mapSize

  const viewportLeft =
    size > 0
      ? (viewport.scrollLeft /
          (size * pixel)) *
        mapSize
      : 0

  const viewportTop =
    size > 0
      ? (viewport.scrollTop /
          (size * pixel)) *
        mapSize
      : 0

  const viewportWidth =
    size > 0
      ? (viewport.clientWidth /
          (size * pixel)) *
        mapSize
      : mapSize

  const viewportHeight =
    size > 0
      ? (viewport.clientHeight /
          (size * pixel)) *
        mapSize
      : mapSize

  const safeLeft = Math.max(
    0,
    Math.min(
      viewportLeft,
      totalDisplayWidth - 8,
    ),
  )

  const safeTop = Math.max(
    0,
    Math.min(
      viewportTop,
      totalDisplayHeight - 8,
    ),
  )

  const safeWidth = Math.max(
    8,
    Math.min(
      viewportWidth,
      totalDisplayWidth - safeLeft,
    ),
  )

  const safeHeight = Math.max(
    8,
    Math.min(
      viewportHeight,
      totalDisplayHeight - safeTop,
    ),
  )

  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-3 shadow-sm">
      <h3 className="mb-2 text-sm font-bold text-gray-700">
        Mini Map
      </h3>

      <div
        className="relative cursor-crosshair overflow-hidden border border-gray-300"
        onClick={(event) => {
          const rect =
            event.currentTarget.getBoundingClientRect()

          const xRatio =
            (event.clientX - rect.left) /
            rect.width

          const yRatio =
            (event.clientY - rect.top) /
            rect.height

          onNavigate(xRatio, yRatio)
        }}
        style={{
          width: mapSize,
          height: mapSize,
        }}
      >
        {beadGrid.map((cell) => (
          <div
            key={`${cell.x}-${cell.y}`}
            style={{
              position: 'absolute',
              left: cell.x * pixel,
              top: cell.y * pixel,
              width: Math.max(pixel, 1),
              height: Math.max(pixel, 1),
              backgroundColor:
                cell.color.hex,
            }}
          />
        ))}

        <div
          className="pointer-events-none absolute border-2 border-violet-600 bg-violet-500/10"
          style={{
            left: safeLeft,
            top: safeTop,
            width: safeWidth,
            height: safeHeight,
          }}
        />
      </div>
    </div>
  )
}