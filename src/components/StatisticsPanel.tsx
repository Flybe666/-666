import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { PaletteColor } from '../engine/colorMatcher'
import {
  createMaterialRows,
  summarizeMaterialRows,
  type InventoryRecord,
} from '../engine/materials'
import type { ColorStatistic } from '../engine/statistics'

type StatisticsPanelProps = {
  statistics: ColorStatistic[]
  beadCount: number
  palette: readonly PaletteColor[]
  activeColorId: string | null
  lockedColorId: string | null
  onHoverColor: (colorId: string | null) => void
  onLockColor: (colorId: string | null) => void
  onReplaceColor: (
    sourceColorId: string,
    targetColorId: string,
  ) => void
}

const FAVORITES_STORAGE_KEY = 'mard-studio-pro-favorites'
const INVENTORY_STORAGE_KEY = 'mard-studio-pro-inventory'

function readFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function readInventory(): InventoryRecord {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as InventoryRecord) : {}
  } catch {
    return {}
  }
}

function escapeCell(value: string | number) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export function StatisticsPanel({
  statistics,
  beadCount,
  palette,
  activeColorId,
  lockedColorId,
  onHoverColor,
  onLockColor,
  onReplaceColor,
}: StatisticsPanelProps) {
  const [query, setQuery] = useState('')
  const [packageSize, setPackageSize] = useState(1000)
  const [packagePrice, setPackagePrice] = useState(45)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(readFavorites)
  const [inventory, setInventory] = useState<InventoryRecord>(readInventory)
  const [sourceColorId, setSourceColorId] = useState('')
  const [targetColorId, setTargetColorId] = useState('')

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory))
  }, [inventory])

  useEffect(() => {
    if (statistics.length === 0) {
      setSourceColorId('')
      return
    }

    if (!statistics.some((item) => item.id === sourceColorId)) {
      setSourceColorId(statistics[0].id)
    }
  }, [sourceColorId, statistics])

  useEffect(() => {
    if (!targetColorId && palette.length > 0) {
      setTargetColorId(palette[0].id)
    }
  }, [palette, targetColorId])

  const rows = useMemo(
    () => createMaterialRows(statistics, packageSize, packagePrice, inventory),
    [inventory, packagePrice, packageSize, statistics],
  )

  const summary = useMemo(
    () => summarizeMaterialRows(rows),
    [rows],
  )

  const filtered = useMemo(() => {
    const normalized = query.trim().toUpperCase()

    return rows.filter((item) => {
      const matchesQuery =
        !normalized ||
        item.id.toUpperCase().includes(normalized) ||
        item.name.toUpperCase().includes(normalized) ||
        item.hex.toUpperCase().includes(normalized)

      const matchesFavorite =
        !favoritesOnly || favorites.includes(item.id)

      return matchesQuery && matchesFavorite
    })
  }, [favorites, favoritesOnly, query, rows])

  if (statistics.length === 0) return null

  function toggleFavorite(colorId: string) {
    setFavorites((current) =>
      current.includes(colorId)
        ? current.filter((id) => id !== colorId)
        : [...current, colorId],
    )
  }

  function updateInventory(colorId: string, packages: number) {
    setInventory((current) => ({
      ...current,
      [colorId]: Math.max(0, Math.floor(packages)),
    }))
  }

  function downloadCsv() {
    const csvRows = [
      ['色號', '名稱', 'HEX', '顆數', '每包顆數', '需要包數', '現有包數', '缺少包數', '預估補貨成本'],
      ...rows.map((item) => [
        item.id,
        item.name,
        item.hex,
        item.count,
        item.packageSize,
        item.requiredPackages,
        item.ownedPackages,
        item.shortagePackages,
        item.estimatedCost,
      ]),
    ]

    const csv = csvRows
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(','),
      )
      .join('\n')

    const blob = new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'mard-materials.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  function downloadExcel() {
    const tableRows = rows
      .map(
        (item) => `
          <tr>
            <td>${escapeCell(item.id)}</td>
            <td>${escapeCell(item.name)}</td>
            <td>${escapeCell(item.hex)}</td>
            <td>${item.count}</td>
            <td>${item.packageSize}</td>
            <td>${item.requiredPackages}</td>
            <td>${item.ownedPackages}</td>
            <td>${item.shortagePackages}</td>
            <td>${item.estimatedCost}</td>
          </tr>`,
      )
      .join('')

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="UTF-8"></head>
        <body>
          <table border="1">
            <tr>
              <th>色號</th><th>名稱</th><th>HEX</th><th>顆數</th>
              <th>每包顆數</th><th>需要包數</th><th>現有包數</th>
              <th>缺少包數</th><th>預估補貨成本</th>
            </tr>
            ${tableRows}
          </table>
        </body>
      </html>`

    const blob = new Blob([html], {
      type: 'application/vnd.ms-excel;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'mard-materials.xls'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">材料與色號管理</h3>
          <p className="text-sm text-gray-500">
            {statistics.length} 色 · {beadCount} 個拼豆格
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={downloadCsv}
            className="rounded-xl border border-emerald-500 px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
          >
            CSV
          </button>
          <button
            type="button"
            onClick={downloadExcel}
            className="rounded-xl border border-green-600 px-3 py-2 text-sm font-bold text-green-700 hover:bg-green-50"
          >
            Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-violet-50 p-3">
          <span className="block text-gray-500">需要包數</span>
          <strong className="text-lg text-violet-700">{summary.requiredPackages}</strong>
        </div>
        <div className="rounded-xl bg-rose-50 p-3">
          <span className="block text-gray-500">缺少包數</span>
          <strong className="text-lg text-rose-700">{summary.shortagePackages}</strong>
        </div>
        <div className="col-span-2 rounded-xl bg-amber-50 p-3">
          <span className="block text-gray-500">預估補貨成本</span>
          <strong className="text-lg text-amber-700">NT$ {summary.estimatedCost}</strong>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs font-semibold text-gray-600">
          每包顆數
          <select
            value={packageSize}
            onChange={(event) => setPackageSize(Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-gray-200 px-2 py-2 text-sm"
          >
            <option value={500}>500</option>
            <option value={1000}>1000</option>
            <option value={2000}>2000</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-gray-600">
          每包價格（NT$）
          <input
            type="number"
            min="0"
            value={packagePrice}
            onChange={(event) => setPackagePrice(Math.max(0, Number(event.target.value)))}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <section className="rounded-2xl border border-violet-200 bg-violet-50 p-3">
        <h4 className="mb-2 text-sm font-bold text-violet-800">整圖顏色替換</h4>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <select
            value={sourceColorId}
            onChange={(event) => setSourceColorId(event.target.value)}
            className="min-w-0 rounded-xl border border-gray-200 bg-white px-2 py-2 text-sm"
          >
            {statistics.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id}（{item.count}）
              </option>
            ))}
          </select>
          <span className="font-bold text-violet-500">→</span>
          <select
            value={targetColorId}
            onChange={(event) => setTargetColorId(event.target.value)}
            className="min-w-0 rounded-xl border border-gray-200 bg-white px-2 py-2 text-sm"
          >
            {palette.map((color) => (
              <option key={color.id} value={color.id}>
                {color.id} · {color.hex}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={!sourceColorId || !targetColorId || sourceColorId === targetColorId}
          onClick={() => onReplaceColor(sourceColorId, targetColorId)}
          className="mt-2 w-full rounded-xl bg-violet-600 px-3 py-2 text-sm font-bold text-white disabled:bg-gray-300"
        >
          套用整圖替換
        </button>
      </section>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜尋色號、名稱或 HEX"
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => setFavoritesOnly((current) => !current)}
          className={`rounded-xl px-3 py-2 text-sm font-bold ${
            favoritesOnly
              ? 'bg-amber-400 text-amber-950'
              : 'border border-amber-300 text-amber-700'
          }`}
        >
          ★ 收藏
        </button>
      </div>

      <div className="max-h-[430px] overflow-y-auto rounded-2xl border border-gray-200 bg-white">
        {filtered.map((item) => {
          const isActive = activeColorId === item.id
          const isDimmed = Boolean(activeColorId) && activeColorId !== item.id
          const isFavorite = favorites.includes(item.id)

          return (
            <div
              key={item.id}
              className={`border-b border-gray-100 p-3 last:border-b-0 ${
                isActive ? 'bg-violet-50 ring-2 ring-inset ring-violet-500' : ''
              } ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
              onMouseEnter={() => {
                if (!lockedColorId) onHoverColor(item.id)
              }}
              onMouseLeave={() => {
                if (!lockedColorId) onHoverColor(null)
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onLockColor(lockedColorId === item.id ? null : item.id)
                    onHoverColor(null)
                  }}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span
                    className="h-8 w-8 shrink-0 rounded-lg border border-gray-300"
                    style={{ backgroundColor: item.hex }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-gray-800">
                      {item.id} · {item.name}
                    </span>
                    <span className="block text-xs text-gray-500">{item.hex}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(item.id)}
                  className={`text-xl ${isFavorite ? 'text-amber-500' : 'text-gray-300'}`}
                  title="收藏常用色"
                >
                  ★
                </button>
              </div>

              <div className="mt-2 grid grid-cols-[1fr_82px] items-end gap-2 text-xs">
                <div className="grid grid-cols-3 gap-1 text-center">
                  <span className="rounded-lg bg-violet-100 px-1 py-1 font-bold text-violet-700">
                    {item.count} 顆
                  </span>
                  <span className="rounded-lg bg-gray-100 px-1 py-1">
                    需 {item.requiredPackages} 包
                  </span>
                  <span className={`rounded-lg px-1 py-1 ${item.shortagePackages > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    缺 {item.shortagePackages}
                  </span>
                </div>
                <label className="text-gray-500">
                  現有包數
                  <input
                    type="number"
                    min="0"
                    value={item.ownedPackages}
                    onChange={(event) => updateInventory(item.id, Number(event.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1 text-sm"
                  />
                </label>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-500">找不到符合的色號</p>
        )}
      </div>
    </div>
  )
}
