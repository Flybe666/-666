import type { PdfSettings } from './pdf/PdfSettings'

type PdfSettingsPanelProps = {
  settings: PdfSettings
  onChange: (settings: PdfSettings) => void
}

export function PdfSettingsPanel({
  settings,
  onChange,
}: PdfSettingsPanelProps) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-gray-800">
        4. PDF 設定
      </h2>

      <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-700">
            顯示總覽圖
          </span>

          <input
            type="checkbox"
            checked={settings.showOverview}
            onChange={(event) =>
              onChange({
                ...settings,
                showOverview: event.target.checked,
              })
            }
            className="h-5 w-5 accent-violet-600"
          />
        </label>

        <label className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-700">
            顯示頁面導航
          </span>

          <input
            type="checkbox"
            checked={settings.showNavigation}
            onChange={(event) =>
              onChange({
                ...settings,
                showNavigation: event.target.checked,
              })
            }
            className="h-5 w-5 accent-violet-600"
          />
        </label>

        <label className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-700">
            顯示頁面材料
          </span>

          <input
            type="checkbox"
            checked={settings.showPageMaterials}
            onChange={(event) =>
              onChange({
                ...settings,
                showPageMaterials: event.target.checked,
              })
            }
            className="h-5 w-5 accent-violet-600"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            每頁格數
          </span>

          <select
            value={settings.cellsPerPage}
            onChange={(event) =>
              onChange({
                ...settings,
                cellsPerPage: Number(event.target.value),
              })
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-700"
          >
            <option value={25}>25 × 25</option>
            <option value={29}>29 × 29</option>
            <option value={50}>50 × 50</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            紙張大小
          </span>

          <select
            value={settings.paperSize}
            onChange={(event) =>
              onChange({
                ...settings,
                paperSize: event.target.value as PdfSettings['paperSize'],
              })
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-700"
          >
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
          </select>
        </label>
      </div>
    </section>
  )
}