import { useState } from 'react'

type PreviewPanelProps = {
  imageUrl?: string
}

export function PreviewPanel({
  imageUrl,
}: PreviewPanelProps) {
  const [zoom, setZoom] = useState(1)

  function zoomIn() {
    setZoom((current) => Math.min(current + 0.25, 3))
  }

  function zoomOut() {
    setZoom((current) => Math.max(current - 0.25, 0.5))
  }

  function resetZoom() {
    setZoom(1)
  }

  return (
    <section className="rounded-2xl bg-gray-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">
          預覽縮放：{Math.round(zoom * 100)}%
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= 0.5}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40"
          >
            −
          </button>

          <button
            type="button"
            onClick={resetZoom}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            重設
          </button>

          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= 3}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40"
          >
            ＋
          </button>
        </div>
      </div>

      <div className="flex min-h-[430px] items-center justify-center overflow-auto rounded-2xl border border-gray-200 bg-white p-5">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="拼豆作品預覽"
            className="max-w-none rounded-xl object-contain shadow-xl"
            style={{
              width: `${300 * zoom}px`,
              imageRendering: 'pixelated',
            }}
          />
        ) : (
          <div className="text-center text-gray-400">
            <p className="text-lg font-semibold">
              Preview
            </p>

            <p className="mt-2 text-sm">
              上傳圖片後將顯示於此
            </p>
          </div>
        )}
      </div>
    </section>
  )
}