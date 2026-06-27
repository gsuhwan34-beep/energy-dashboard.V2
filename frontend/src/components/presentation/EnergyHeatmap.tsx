import { useMemo } from 'react'
import type { EnergyReading } from '../../hooks/useEnergyData'
import { buildHourlyHeatmap, heatmapColor } from '../../lib/presentation'

interface Props {
  readings: EnergyReading[]
  title?: string
}

export default function EnergyHeatmap({ readings, title = '시간대별 전력 히트맵' }: Props) {
  const grid = useMemo(() => buildHourlyHeatmap(readings, 7), [readings])
  const maxWh = useMemo(
    () => Math.max(...grid.flat().map((c) => c.wh), 1),
    [grid],
  )

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 md:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm md:text-base font-bold text-white">{title}</h3>
        <span className="text-[10px] text-white/50">1칸 = 1시간 · 최근 7일</span>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="flex gap-0.5 mb-1 pl-14">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="flex-1 min-w-[10px] max-w-[20px] text-center">
                {h % 6 === 0 && (
                  <span className="text-[8px] text-white/35 font-mono">{h}</span>
                )}
              </div>
            ))}
          </div>

          {grid.map((row) => (
            <div key={row[0]?.dayLabel} className="flex items-center gap-1 mb-0.5">
              <span className="w-12 text-[9px] text-white/50 shrink-0 text-right pr-1">{row[0]?.dayLabel}</span>
              <div className="flex gap-0.5 flex-1">
                {row.map((cell) => (
                  <div
                    key={cell.key}
                    title={`${cell.dayLabel} ${cell.hour}시 · ${cell.wh.toFixed(2)} Wh (${cell.count}회)`}
                    className="aspect-square flex-1 min-w-[10px] max-w-[20px] rounded-sm transition-transform hover:scale-125 hover:z-10 cursor-default"
                    style={{ backgroundColor: heatmapColor(cell.wh, maxWh) }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
        <span className="text-[9px] text-white/40">낮음</span>
        <div className="flex gap-0.5 flex-1">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => (
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
