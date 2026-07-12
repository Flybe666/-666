import type {
  ProProcessingSettings,
  QuantizationMode,
} from '../engine/proProcessor'

type Props = {
  settings: ProProcessingSettings
  onChange: (settings: ProProcessingSettings) => void
}

export function ProSettingsPanel({ settings, onChange }: Props) {
  function update<K extends keyof ProProcessingSettings>(
    key: K,
    value: ProProcessingSettings[K],
  ) {
    onChange({ ...settings, [key]: value })
  }

  return (
    <section className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">4. Pro 圖像處理</h2>
        <span className="rounded-full bg-violet-600 px-2 py-1 text-xs font-bold text-white">
          PRO
        </span>
      </div>

      <label className="mb-3 block text-sm font-medium text-gray-700">
        配色模式
        <select
          value={settings.mode}
          onChange={(event) =>
            update('mode', event.target.value as QuantizationMode)
          }
          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2"
        >
          <option value="nearest">清晰色塊（最近色）</option>
          <option value="floyd-steinberg">細緻漸層（Floyd–Steinberg）</option>
        </select>
      </label>

      <label className="mb-3 block text-sm font-medium text-gray-700">
        抖色強度：{Math.round(settings.ditheringStrength * 100)}%
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={settings.ditheringStrength}
          disabled={settings.mode !== 'floyd-steinberg'}
          onChange={(event) =>
            update('ditheringStrength', Number(event.target.value))
          }
          className="mt-2 w-full disabled:opacity-40"
        />
      </label>

      <label className="mb-3 block text-sm font-medium text-gray-700">
        白底判定：RGB ≥ {settings.whiteThreshold}
        <input
          type="range"
          min="220"
          max="255"
          step="1"
          value={settings.whiteThreshold}
          onChange={(event) =>
            update('whiteThreshold', Number(event.target.value))
          }
          className="mt-2 w-full"
        />
      </label>

      <label className="block text-sm font-medium text-gray-700">
        雜點清理
        <select
          value={settings.cleanupPasses}
          onChange={(event) =>
            update('cleanupPasses', Number(event.target.value))
          }
          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2"
        >
          <option value={0}>關閉</option>
          <option value={1}>標準（1 次）</option>
          <option value={2}>強力（2 次）</option>
        </select>
      </label>
    </section>
  )
}
