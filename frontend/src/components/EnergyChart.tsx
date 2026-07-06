import { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EnergyReading } from '../hooks/useEnergyData'
import { PeriodTabButton } from './ChartPeriodCalendar'
import {
  type CandleInterval,
  buildVolumeBars,
  getVolumeSubtitle,
  CANDLE_INTERVAL_TABS,
} from '../lib/candleAggregation'
import { toDeltaReadings } from '../lib/readingDelta'

interface CumulativeBadge {
  label: string
  kWh: number
  wh?: number
  hint?: string
}

interface Props {
  readings: EnergyReading[]
  cumulativeBadge?: CumulativeBadge
}

const tooltipBg = '#fff'
const tooltipBorder = 'rgba(42,42,42,0.08)'
const fgBase = '#212121'
const fgSubtle = '#7a7a7a'
const barColor = 'rgba(253,75,150,0.65)'

export default function EnergyChart({ readings, cumulativeBadge }: Props) {
  const [interval, setInterval] = useState<CandleInterval>('tick')

  const deltaReadings = useMemo(() => toDeltaReadings(readings), [readings])
  const bars = useMemo(() => buildVolumeBars(deltaReadings, interval), [deltaReadings, interval])
  const subtitle = useMemo(() => getVolumeSubtitle(interval, bars.length), [interval, bars.length])
  const hasData = bars.length > 0

  const option = useMemo(() => {
    if (!hasData) return {}

    const barData = bars.map((b) => [b.time, b.volume])

    return {
      animation: false,
      grid: { left: 56, right: 16, top: 20, bottom: 36 },
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: { type: 'shadow' as const },
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: fgBase, fontSize: 12 },
        extraCssText: 'border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.08);',
        formatter(params: unknown) {
          const list = (Array.isArray(params) ? params : [params]) as Array<{ dataIndex?: number }>
          const idx = list[0]?.dataIndex ?? 0
          const b = bars[idx]
          if (!b) return ''
          const timeStr = new Date(b.time).toLocaleString('ko-KR', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
          return (
            `<div style="font-weight:600;margin-bottom:6px">${timeStr}</div>` +
            `<div>전송량 <b>${b.volume.toLocaleString()}</b> Wh</div>` +
            `<div style="font-size:11px;color:${fgSubtle};margin-top:4px">${b.count}회 전송</div>`
          )
        },
      },
      xAxis: {
        type: 'time' as const,
        axisLine: { lineStyle: { color: '#7a7a7a' } },
        axisLabel: { color: fgSubtle, fontSize: 9 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value' as const,
        name: 'Wh',
        nameTextStyle: { color: fgSubtle, fontSize: 10 },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: fgSubtle, fontSize: 10 },
        splitLine: { lineStyle: { type: 'dashed' as const, color: '#f0f0f0' } },
      },
      dataZoom: [
        {
          type: 'inside' as const,
          start: bars.length > 80 ? Math.max(0, 100 - (80 / bars.length) * 100) : 0,
          end: 100,
        },
      ],
      series: [
        {
          name: '전송량',
          type: 'bar',
          data: barData,
          itemStyle: { color: barColor },
          barMaxWidth: interval === 'tick' ? 8 : 24,
        },
      ],
    }
  }, [bars, hasData, interval])

  return (
    <div className="border border-border-strong rounded-lg bg-bg-base-opaque p-4">
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1">
          {CANDLE_INTERVAL_TABS.map((t) => (
            <PeriodTabButton
              key={t.key}
              active={interval === t.key}
              onClick={() => setInterval(t.key)}
            >
              {t.label}
            </PeriodTabButton>
          ))}
        </div>

        {cumulativeBadge && (
          <div className="flex justify-end">
            <div className="text-right px-2.5 py-1.5 rounded-md border border-border-strong bg-bg-subtle min-w-[120px]">
              <div className="text-[9px] text-fg-muted font-medium">{cumulativeBadge.label}</div>
              <div className="text-sm font-bold text-brand-100 font-mono">
                {cumulativeBadge.kWh.toFixed(4)} kWh
              </div>
              {(cumulativeBadge.wh != null || cumulativeBadge.hint) && (
                <div className="text-[9px] text-fg-muted">
                  {cumulativeBadge.wh != null
                    ? `${cumulativeBadge.wh.toLocaleString()} Wh`
                    : cumulativeBadge.hint}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="text-[10px] text-fg-muted mb-2">{subtitle}</p>

      {hasData ? (
        <ReactECharts option={option} style={{ height: 280 }} opts={{ renderer: 'svg' }} notMerge />
      ) : (
        <div className="h-[280px] flex items-center justify-center text-sm text-fg-muted">
          기록된 데이터가 없습니다
        </div>
      )}
    </div>
  )
}
