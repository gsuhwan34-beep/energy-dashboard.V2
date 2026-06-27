import { useMemo } from 'react'
import type { EnergyReading } from '../../hooks/useEnergyData'
import { buildDailyHeatmap, heatmapColor } from '../../lib/presentation'

interface Props {
  title: string
  subtitle?: string
  readings: EnergyReading[]
  date: Date
}

export default function DailyHeatmap({ title, subtitle, readings, date }: Props) {
  const cells = useMemo(() => buildDailyHeatmap(readings, date), [readings, date])
  const maxWh = useMemo(() => Math.max(...cells.map((c) => c.wh), 1), [cells])
  const dayTotal = cells.reduce((s, c) => s + c.wh, 0)

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 md:p-4 flex flex-col h-full min-h-0">
      <div className="mb-2 shrink-0">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        {subtitle && <p className="text-[10px] font-mono text-white/40 truncate">{subtitle}</p>}
        <p className="text-xs text-white/50 mt-1">
          합계 <span className="text-white font-semibold">{dayTotal.toFixed(2)} Wh</span>
          {' '}({(dayTotal / 1000).toFixed(4)} kWh)
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-0">
        <div className="grid grid-cols-12 md:grid-cols-24 gap-1">
          {cells.map((cell) => (
            <div
              key={cell.hour}
              title={`${cell.hour}시 · ${cell.wh.toFixed(2)} Wh (${cell.count}회)`}
              className="aspect-square rounded-sm min-h-[14px] transition-transform hover:scale-110"
              style={{ backgroundColor: heatmapColor(cell.wh, maxWh) }}
            />
          ))}
        </div>
        <div className="grid grid-cols-12 md:grid-cols-24 gap-1 mt-1">
          {cells.map((cell) => (
            <span key={`l-${cell.hour}`} className="text-[8px] text-white/30 text-center hidden md:block">
              {cell.hour % 6 === 0 ? cell.hour : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
