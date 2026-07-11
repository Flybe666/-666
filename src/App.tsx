import PatternGrid from "./components/PatternGrid"
import { useRef, useState } from 'react'
import { exportPatternPdf } from './components/pdf/PatternPdf'
import { createBeadGrid, type BeadCell } from './engine/grid'
import {
  calculateColorStatistics,
  type ColorStatistic,
} from './engine/statistics'
import { mard221 } from './data/mard221'
import { quantizeImageData } from './engine/quantize'

const sizes = [29, 58, 104, 128, 208]

function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null)

  const [selectedSize, setSelectedSize] = useState(104)
  const [fileName, setFileName] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [isConverted, setIsConverted] = useState(false)
const [statistics, setStatistics] = useState<ColorStatistic[]>([])
const [beadGrid, setBeadGrid] = useState<BeadCell[]>([])
  function handleFile(file?: File) {
    if (!file || !file.type.startsWith('image/')) return

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    const url = URL.createObjectURL(file)

    setFileName(file.name)
    setPreviewUrl(url)
    setIsConverted(false)
    setStatistics([])
    setBeadGrid([])



  }
function convertImage() {
    if (!previewUrl || !sourceCanvasRef.current) return

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
            {statistics.length > 0 && (
  <div className="mt-6">
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-lg font-bold text-gray-800">
        <p className="text-sm text-gray-500">
  已建立 {beadGrid.length} 個拼豆格
</p>
        顏色統計
      </h3>

      <span className="text-sm text-gray-500">
        共{' '}
        {statistics.reduce(
          (total, item) => total + item.count,
          0,
        )}{' '}
        顆
      </span>
    </div>

    <div className="max-h-72 overflow-y-auto rounded-2xl border border-gray-200 bg-white">
      {statistics.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0"
        >
          <div className="flex items-center gap-3">
            <span
              className="h-7 w-7 shrink-0 rounded-lg border border-gray-300"
              style={{ backgroundColor: item.hex }}
            />

            <div>
              <p className="font-semibold text-gray-800">
                {item.id} · {item.name}
              </p>
              <p className="text-xs text-gray-500">
                {item.hex}
              </p>
            </div>
          </div>

          <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-bold text-violet-700">
            {item.count} 顆
          </span>
        </div>
      ))}
    </div>
  </div>
)}

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

          <button
            type="button"
            onClick={convertImage}
            disabled={!previewUrl}
            className="w-full rounded-2xl bg-violet-600 px-5 py-4 font-bold text-white hover:bg-violet-700 disabled:bg-gray-300"
          >
            開始轉換
          </button>
<button
  type="button"
  onClick={downloadPng}
  disabled={!isConverted}
  className="mt-3 w-full rounded-2xl border border-violet-500 py-4 font-bold text-violet-600 hover:bg-violet-50 disabled:opacity-40"
>
  下載 PNG
  <button
  type="button"
 onClick={downloadPdf}
  disabled={!isConverted}
  className="mt-3 w-full rounded-2xl border border-pink-500 py-4 font-bold text-pink-600 hover:bg-pink-50 disabled:opacity-40"
>
  下載 PDF
</button>
</button>
 </aside>

        <section className="min-h-[600px] rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">拼豆預覽</h2>
              <p className="text-sm text-gray-500">
                目前尺寸：{selectedSize}×{selectedSize}
              </p>
            </div>

            <span className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500">
              MARD 221
            </span>
          </div>

          <div className="flex min-h-[500px] items-center justify-center rounded-2xl bg-gray-50 p-6">
            {!previewUrl && (
              <div className="text-center text-gray-400">
                <div className="text-6xl">🧩</div>
                <p className="mt-4 text-lg font-medium">
                  上傳圖片後會顯示在這裡
                </p>
              </div>
            )}

            {previewUrl && !isConverted && (
              <img
                src={previewUrl}
                alt="原始圖片預覽"
                className="max-h-[500px] max-w-full rounded-xl object-contain shadow-xl"
              />
            )}

            <canvas
              ref={sourceCanvasRef}
              className={`max-h-[500px] max-w-full rounded-xl border border-gray-200 shadow-xl ${
                isConverted ? 'block' : 'hidden'
              }`}
              style={{
                imageRendering: 'pixelated',
                width: 'min(100%, 500px)',
                aspectRatio: '1 / 1',
              }}
            />
          </div>
        </section>
        <PatternGrid
  beadGrid={beadGrid}
  size={selectedSize}
/>
      </main>
    </div>
  )
}

export default App
