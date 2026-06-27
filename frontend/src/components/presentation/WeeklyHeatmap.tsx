import { useMemo } from 'react'
import type { EnergyReading } from '../../hooks/useEnergyData'
import { buildDailyHeatmap, heatmapColor, getCalendarWeekDays, formatDayLabel } from '../../lib/presentation'

interface Props {
  title: string
  subtitle?: string
  readings: EnergyReading[]
  anchorDate: Date
}

export default function WeeklyHeatmap({ title, subtitle, readings, anchorDate }: Props) {
  const weekDays = useMemo(() => getCalendarWeekDays(anchorDate), [anchorDate])

  const rows = useMemo(
    () => weekDays.map((day) => ({
      day,
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

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 md:p-4 flex flex-col h-full min-h-0">
      <div className="mb-2 shrink-0">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        {subtitle && <p className="text-[10px] font-mono text-white/40 truncate">{subtitle}</p>}
        <p className="text-xs text-white/50 mt-1">
          주간 합계{' '}
          <span className="text-white font-semibold">{weekTotal.toFixed(2)} Wh</span>
          {' '}({(weekTotal / 1000).toFixed(4)} kWh)
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="min-w-[520px]">
          <div className="flex gap-1 mb-1 pl-14">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="flex-1 min-w-[12px] text-center">
                {h % 6 === 0 && (
                  <span className="text-[8px] text-white/35 font-mono">{h}</span>
                )}
              </div>
            ))}
          </div>

          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-1 mb-0.5">
              <span className="w-14 text-[9px] text-white/50 shrink-0 text-right pr-1 truncate">
                {row.label}
              </span>
              <div className="flex gap-0.5 flex-1">
                {row.cells.map((cell) => (
                  <div
                    key={`${row.label}-${cell.hour}`}
                    title={`${row.label} ${cell.hour}시 · ${cell.wh.toFixed(2)} Wh`}
                    className="flex-1 aspect-square min-w-[10px] max-w-[16px] rounded-sm hover:scale-125 transition-transform"
                    style={{ backgroundColor: heatmapColor(cell.wh, maxWh) }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 shrink-0">
        <span className="text-[9px] text-white/40">낮음</span>
        <div className="flex gap-0.5 flex-1">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <div
              key={t}
              className="h-2 flex-1 rounded-sm"
              style={{ backgroundColor: heatmapColor(t * maxWh, maxWh) }}
            />
          ))}
        </div>
        <span className="text-[9px] text-white/40">높음</span>
      </div>
    </div>
  )
}
