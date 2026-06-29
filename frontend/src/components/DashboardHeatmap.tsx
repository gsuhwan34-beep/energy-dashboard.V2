import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import type { EnergyReading } from '../hooks/useEnergyData'
import {
  buildDailyHeatmap,
  heatmapColor,
  getCalendarWeekDays,
  formatDayLabel,
  toDateInputValue,
} from '../lib/presentation'

interface Props {
  title: string
  readings: EnergyReading[]
  anchorDate: Date
  onAnchorDateChange: (date: Date) => void
}

const CELL = 'w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0'

export default function DashboardHeatmap({ title, readings, anchorDate, onAnchorDateChange }: Props) {
  const weekDays = useMemo(() => getCalendarWeekDays(anchorDate), [anchorDate])

  const rows = useMemo(
    () =>
      weekDays.map((day) => ({
        label: formatDayLabel(day),
        cells: buildDailyHeatmap(readings, day),
      })),
    [weekDays, readings],
  )

  const maxWh = useMemo(
    () => Math.max(...rows.flatMap((r) => r.cells.map((c) => c.wh)), 1),
    [rows],
  )

  const weekTotal = rows.reduce((s, r) => s + r.cells.reduce((a, c) => a + c.wh, 0), 0)
  const weekLabel = `${formatDayLabel(weekDays[0])} ~ ${formatDayLabel(weekDays[6])}`

  return (
    <div className="border border-border-strong rounded-lg bg-bg-base-opaque p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-fg-base">{title}</h3>
          <p className="text-[10px] text-fg-muted mt-0.5">
            {weekLabel} · 주간 {(weekTotal / 1000).toFixed(4)} kWh
          </p>
        </div>
        <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border-strong bg-bg-subtle text-xs shrink-0">
          <Calendar className="w-3.5 h-3.5 text-fg-muted" />
          <input
            type="date"
            value={toDateInputValue(anchorDate)}
            onChange={(e) => {
              const [y, m, d] = e.target.value.split('-').map(Number)
              onAnchorDateChange(new Date(y, m - 1, d))
            }}
            className="bg-transparent text-fg-base font-medium outline-none [color-scheme:light]"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-0 max-w-full">
          <div className="flex gap-0.5 mb-1 pl-[52px]">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className={`${CELL} flex items-end justify-center`}>
                {h % 6 === 0 && (
                  <span className="text-[8px] text-fg-muted font-mono">{h}</span>
                )}
              </div>
            ))}
          </div>

          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-1 mb-0.5">
              <span className="w-[48px] text-[9px] text-fg-muted shrink-0 text-right pr-1 truncate">
                {row.label}
              </span>
              <div className="flex gap-0.5">
                {row.cells.map((cell) => (
                  <div
                    key={`${row.label}-${cell.hour}`}
                    title={`${row.label} ${cell.hour}시 · ${cell.wh.toFixed(2)} Wh`}
                    className={`${CELL} rounded-sm hover:ring-1 hover:ring-brand-100/50 transition-transform hover:scale-125`}
                    style={{ backgroundColor: heatmapColor(cell.wh, maxWh) }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border-base">
        <span className="text-[9px] text-fg-muted">낮음</span>
        <div className="flex gap-0.5 flex-1 max-w-xs">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <div
              key={t}
              className="h-1.5 flex-1 rounded-sm"
              style={{ backgroundColor: heatmapColor(t * maxWh, maxWh) }}
            />
          ))}
        </div>
        <span className="text-[9px] text-fg-muted">높음</span>
      </div>
    </div>
  )
}
