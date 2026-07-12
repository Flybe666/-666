import type { ColorStatistic } from '../engine/statistics'

type StatisticsPanelProps = {
  statistics: ColorStatistic[]
  beadCount: number
  activeColorId: string | null
  lockedColorId: string | null
  onHoverColor: (colorId: string | null) => void
  onLockColor: (colorId: string | null) => void
}

export function StatisticsPanel({
  statistics,
  beadCount,
  activeColorId,
  lockedColorId,
  onHoverColor,
  onLockColor,
}: StatisticsPanelProps) {
  if (statistics.length === 0) {
    return null
  }

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            顏色統計
          </h3>

          <p className="text-sm text-gray-500">
            已建立 {beadCount} 個拼豆格
          </p>
        </div>

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
        {statistics.map((item) => {
          const isActive = activeColorId === item.id
          const isDimmed =
            Boolean(activeColorId) &&
            activeColorId !== item.id

          return (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => {
                if (!lockedColorId) {
                  onHoverColor(item.id)
                }
              }}
              onMouseLeave={() => {
                if (!lockedColorId) {
                  onHoverColor(null)
                }
              }}
              onClick={() => {
                onLockColor(
                  lockedColorId === item.id
                    ? null
                    : item.id,
                )

                onHoverColor(null)
              }}
              className={`flex w-full cursor-pointer items-center justify-between border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 ${
                isActive
                  ? 'bg-violet-50 ring-2 ring-inset ring-violet-500'
                  : 'hover:bg-gray-50'
              } ${
                isDimmed
                  ? 'opacity-30'
                  : 'opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-7 w-7 shrink-0 rounded-lg border border-gray-300"
                  style={{
                    backgroundColor: item.hex,
                  }}
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
            </button>
          )
        })}
      </div>
    </div>
  )
}