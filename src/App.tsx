import PatternGrid from './components/PatternGrid'
import { useRef, useState } from 'react'
import { exportPatternPdf } from './components/pdf/PatternPdf'
import { createBeadGrid, type BeadCell } from './engine/grid'
import {
  calculateColorStatistics,
  type ColorStatistic,
} from './engine/statistics'
import { mard221 } from './data/mard221'
import { quantizeImageData } from './engine/quantize'
import { PdfSettingsPanel } from './components/PdfSettingsPanel'
import {
  defaultPdfSettings,
  type PdfSettings,
} from './components/pdf/PdfSettings'
import { PreviewPanel } from './components/pdf/PreviewPanel'
import { StatisticsPanel } from './components/StatisticsPanel'
import { createBoardLayout } from './engine/boardLayout'
import type { BoardSection } from './types/board'
import BoardNavigator from './components/BoardNavigator'

const sizes = [29, 58, 104, 128, 208]

function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const sourceCanvasRef =
    useRef<HTMLCanvasElement>(null)

  const [selectedSize, setSelectedSize] =
    useState(104)

  const [boards, setBoards] =
    useState<BoardSection[]>([])

  const [selectedBoard, setSelectedBoard] =
    useState<BoardSection | null>(null)

  const [zoom, setZoom] =
     useState(1)

  const [fileName, setFileName] =
    useState('')

  const [previewUrl, setPreviewUrl] =
    useState('')

  const [isConverted, setIsConverted] =
    useState(false)

  const [statistics, setStatistics] =
    useState<ColorStatistic[]>([])

  const [hoveredColorId, setHoveredColorId] =
    useState<string | null>(null)

  const [lockedColorId, setLockedColorId] =
    useState<string | null>(null)

  const activeColorId =
    lockedColorId ?? hoveredColorId

  const [beadGrid, setBeadGrid] =
    useState<BeadCell[]>([])

  const [pdfSettings, setPdfSettings] =
    useState<PdfSettings>(defaultPdfSettings)

  function handleFile(file?: File) {
    if (!file || !file.type.startsWith('image/')) {
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    const url = URL.createObjectURL(file)

    setFileName(file.name)
    setPreviewUrl(url)
    setIsConverted(false)
    setStatistics([])
    setBeadGrid([])
setBoards([])
setSelectedBoard(null)


  }
function convertImage() {
    if (!previewUrl || !sourceCanvasRef.current) return

const newBoards = createBoardLayout(
  selectedSize,
  29,
)

setBoards(newBoards)
    const image = new Image()
    image.src = previewUrl

    image.onload = () => {
      const canvas = sourceCanvasRef.current
      if (!canvas) return

      canvas.width = selectedSize
      canvas.height = selectedSize

      const context = canvas.getContext('2d')
      if (!context) return

      context.imageSmoothingEnabled = false
      context.clearRect(0, 0, selectedSize, selectedSize)

const sourceRatio = image.width / image.height

let sourceX = 0
let sourceY = 0
let sourceWidth = image.width
let sourceHeight = image.height

if (sourceRatio > 1) {
  sourceWidth = image.height
  sourceX = (image.width - sourceWidth) / 2
} else {
  sourceHeight = image.width
  sourceY = (image.height - sourceHeight) / 2
}

// 1. 先把圖片畫進 Canvas
context.drawImage(
  image,
  sourceX,
  sourceY,
  sourceWidth,
  sourceHeight,
  0,
  0,
  selectedSize,
  selectedSize,
)

// 2. 再讀取像素資料
const originalImageData = context.getImageData(
  0,
  0,
  selectedSize,
  selectedSize,
)

// 3. 建立拼豆資料與顏色統計
const newBeadGrid = createBeadGrid(originalImageData, mard221)
const colorStatistics = calculateColorStatistics(newBeadGrid)
setBeadGrid(newBeadGrid)
setStatistics(colorStatistics)

// 4. 套用目前的測試色盤
const convertedImageData = quantizeImageData(
  originalImageData,
  mard221,
)

context.putImageData(convertedImageData, 0, 0)

// 5. 最後才畫格線
context.strokeStyle = 'rgba(0, 0, 0, 0.25)'
context.lineWidth = 0.08



      for (let x = 0; x <= selectedSize; x += 1) {
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, selectedSize)
        context.stroke()
      }

      for (let y = 0; y <= selectedSize; y += 1) {
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(selectedSize, y)
        context.stroke()
      }

      setIsConverted(true)
    }

    image.onerror = () => {
      alert('圖片讀取失敗，請重新選擇圖片。')
    }
    }
function downloadPng() {
  const canvas = sourceCanvasRef.current

  if (!canvas || !isConverted) {
    alert('請先完成圖片轉換。')
    return
  }

  const cellSize = 12
  const downloadCanvas = document.createElement('canvas')

  downloadCanvas.width = selectedSize * cellSize
  downloadCanvas.height = selectedSize * cellSize

  const context = downloadCanvas.getContext('2d')

  if (!context) {
    alert('無法建立下載圖片。')
    return
  }

  context.imageSmoothingEnabled = false
  context.drawImage(
    canvas,
    0,
    0,
    selectedSize,
    selectedSize,
    0,
    0,
    downloadCanvas.width,
    downloadCanvas.height,
  )

  const link = document.createElement('a')
  link.download = `beads-studio-${selectedSize}x${selectedSize}.png`
  link.href = downloadCanvas.toDataURL('image/png')
  link.click()
}
function downloadPdf() {
  if (beadGrid.length === 0 || !isConverted) {
    alert('請先完成圖片轉換。')
    return
  }

  exportPatternPdf({
  beadGrid,
  size: selectedSize,
  settings: pdfSettings,
})
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50">
      <header className="border-b border-violet-100 bg-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-violet-700">
              Beads Studio
            </h1>
            <p className="text-sm text-gray-500">
              拼豆圖片轉換與設計工具
            </p>
          </div>

          <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700">
            v0.2
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-6 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">
              1. 上傳圖片
            </h2>

            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 px-4 py-8 text-center hover:bg-violet-100"
            >
              <span className="block text-4xl">🖼️</span>
              <span className="mt-3 block font-semibold text-violet-700">
                點擊選擇圖片
              </span>
              <span className="mt-1 block text-sm text-gray-500">
                支援 JPG、PNG、WEBP
              </span>
            </button>

            {fileName && (
              <p className="mt-3 break-all text-sm text-gray-600">
                已選擇：{fileName}
              </p>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">
              2. 選擇拼豆尺寸
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
onClick={() => {
  setSelectedSize(size)
  setIsConverted(false)
  setBoards([])
  setSelectedBoard(null)
}}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold ${
                    selectedSize === size
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-violet-100'
                  }`}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
<StatisticsPanel
  statistics={statistics}
  beadCount={beadGrid.length}
  activeColorId={activeColorId}
  lockedColorId={lockedColorId}
  onHoverColor={setHoveredColorId}
  onLockColor={setLockedColorId}
/>

<BoardNavigator
  boards={boards}
  selectedBoardId={selectedBoard?.id ?? null}
  onSelectBoard={setSelectedBoard}
/>
          </section>

          <section>
            <label className="mb-2 block text-lg font-semibold text-gray-800">
              3. 選擇色盤
            </label>

            <select className="w-full rounded-xl border border-gray-200 px-4 py-3">
              <option>MARD 221</option>
              <option disabled>Artkal（開發中）</option>
              <option disabled>Perler（開發中）</option>
            </select>
          </section>

          <PdfSettingsPanel
            settings={pdfSettings}
            onChange={setPdfSettings}
          />

          <button
            type="button"
            onClick={convertImage}
            disabled={!previewUrl}
            className="w-full rounded-2xl bg-violet-600 px-5 py-4 font-bold text-white hover:bg-violet-700 disabled:bg-gray-300"
          >
            開始轉換
          </button>

          <div className="space-y-3">
            <button
              type="button"
              onClick={downloadPng}
              disabled={!isConverted}
              className="w-full rounded-2xl border border-violet-500 py-4 font-bold text-violet-600 hover:bg-violet-50 disabled:opacity-40"
            >
              下載 PNG
            </button>

            <button
              type="button"
              onClick={downloadPdf}
              disabled={!isConverted}
              className="w-full rounded-2xl border border-pink-500 py-4 font-bold text-pink-600 hover:bg-pink-50 disabled:opacity-40"
            >
              下載 PDF
            </button>
          </div>
        </aside>

        <section className="min-h-[600px] rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                拼豆預覽
              </h2>

              <p className="text-sm text-gray-500">
                目前尺寸：{selectedSize}×{selectedSize}
              </p>
            </div>

            <span className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500">
              MARD 221
            </span>
          </div>

          <PreviewPanel imageUrl={previewUrl} />

          <canvas
            ref={sourceCanvasRef}
            className="hidden"
            width={selectedSize}
            height={selectedSize}
            style={{
              imageRendering: 'pixelated',
            }}
          />
        </section>

        <div className="min-w-0 overflow-x-auto lg:col-span-2">
          <div className="mb-3 flex items-center justify-end gap-2">
  <button
    type="button"
    onClick={() =>
      setZoom((current) =>
        Math.max(0.25, current - 0.25),
      )
    }
    className="rounded-lg border border-violet-300 px-3 py-2 font-bold text-violet-700 hover:bg-violet-50"
  >
    −
  </button>

  <button
    type="button"
    onClick={() => setZoom(1)}
    className="rounded-lg bg-violet-100 px-4 py-2 font-bold text-violet-700"
  >
    {Math.round(zoom * 100)}%
  </button>

  <button
    type="button"
    onClick={() =>
      setZoom((current) =>
        Math.min(4, current + 0.25),
      )
    }
    className="rounded-lg border border-violet-300 px-3 py-2 font-bold text-violet-700 hover:bg-violet-50"
  >
    ＋
  </button>
</div>
<PatternGrid
  beadGrid={beadGrid}
  size={selectedSize}
  hoveredColorId={hoveredColorId}
  lockedColorId={lockedColorId}
  onHoverColor={setHoveredColorId}
  onLockColor={setLockedColorId}
  selectedBoard={selectedBoard}
  zoom={zoom}
/>
        </div>
      </main>
    </div>
  )
}

export default App
