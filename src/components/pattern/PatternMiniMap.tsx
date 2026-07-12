import type { BeadCell } from '../../engine/grid'

export type PatternViewport = {
  scrollLeft: number
  scrollTop: number
  clientWidth: number
  clientHeight: number
  scrollWidth: number
  scrollHeight: number
}

type PatternMiniMapProps = {
  beadGrid: BeadCell[]
  size: number
  viewport: PatternViewport
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

  const pixel =
    size > 0
      ? mapSize / size
      : 0

  const viewportLeft =
    (
      viewport.scrollLeft /
      Math.max(
        1,
        viewport.scrollWidth,
      )
    ) * mapSize

  const viewportTop =
    (
      viewport.scrollTop /
      Math.max(
        1,
        viewport.scrollHeight,
      )
    ) * mapSize

  const viewportWidth =
    (
      viewport.clientWidth /
      Math.max(
        1,
        viewport.scrollWidth,
      )
    ) * mapSize

  const viewportHeight =
    (
      viewport.clientHeight /
      Math.max(
        1,
        viewport.scrollHeight,
      )
    ) * mapSize

  const safeLeft = Math.max(
    0,
    Math.min(
      viewportLeft,
      mapSize - 8,
    ),
  )

  const safeTop = Math.max(
    0,
    Math.min(
      viewportTop,
      mapSize - 8,
    ),
  )

  const safeWidth = Math.max(
    8,
    Math.min(
      viewportWidth,
      mapSize - safeLeft,
    ),
  )

  const safeHeight = Math.max(
    8,
    Math.min(
      viewportHeight,
      mapSize - safeTop,
    ),
  )

  function navigateFromPointer(
    clientX: number,
    clientY: number,
    element: HTMLDivElement,
  ) {
    const rect =
      element.getBoundingClientRect()

    const xRatio = Math.max(
      0,
      Math.min(
        1,
        (clientX - rect.left) /
          rect.width,
      ),
    )

    const yRatio = Math.max(
      0,
      Math.min(
        1,
        (clientY - rect.top) /
          rect.height,
      ),
    )

    onNavigate(xRatio, yRatio)
  }

  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-3 shadow-sm">
      <h3 className="mb-2 text-sm font-bold text-gray-700">
        Mini Map
      </h3>

      <div
        className="relative cursor-crosshair overflow-hidden border border-gray-300"
        onClick={(event) => {
          navigateFromPointer(
            event.clientX,
            event.clientY,
            event.currentTarget,
          )
        }}
        onPointerMove={(event) => {
          if (event.buttons !== 1) {
            return
          }

          navigateFromPointer(
            event.clientX,
            event.clientY,
            event.currentTarget,
          )
        }}
        style={{
          width: mapSize,
          height: mapSize,
          touchAction: 'none',
        }}
      >
        {beadGrid.map((cell) => (
          <div
            key={
              `${cell.x}-${cell.y}`
            }
            style={{
              position: 'absolute',
              left:
                cell.x * pixel,
              top:
                cell.y * pixel,
              width:
                Math.max(
                  pixel,
                  1,
                ),
              height:
                Math.max(
                  pixel,
                  1,
                ),
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

      <p className="mt-2 text-xs text-gray-500">
        點擊或按住拖曳可快速定位
      </p>
    </div>
  )
}