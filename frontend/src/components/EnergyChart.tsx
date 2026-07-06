import { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EnergyReading } from '../hooks/useEnergyData'
import { PeriodTabButton } from './ChartPeriodCalendar'
import {
  type CandleInterval,
  buildCandles,
  getCandleSubtitle,
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
const upColor = '#fd4b96'
const downColor = '#3b82f6'
const volUp = 'rgba(253,75,150,0.45)'
const volDown = 'rgba(59,130,246,0.45)'

export default function EnergyChart({ readings, cumulativeBadge }: Props) {
  const [interval, setCandleInterval] = useState<CandleInterval>('tick')

  const deltaReadings = useMemo(() => toDeltaReadings(readings), [readings])
  const candles = useMemo(() => buildCandles(deltaReadings, interval), [deltaReadings, interval])
  const subtitle = useMemo(() => getCandleSubtitle(interval, candles.length), [interval, candles.length])
  const hasData = candles.length > 0

  const option = useMemo(() => {
    if (!hasData) return {}

    const candleData = candles.map((c) => [c.time, c.open, c.close, c.low, c.high])
    const volumeData = candles.map((c) => ({
      value: [c.time, c.volume],
      itemStyle: {
        color: c.close >= c.open ? volUp : volDown,
      },
    }))

    return {
      animation: false,
      axisPointer: { link: [{ xAxisIndex: [0, 1] }] },
      grid: [
        { left: 56, right: 16, top: 20, height: '56%' },
        { left: 56, right: 16, top: '76%', height: '14%' },
      ],
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: { type: 'cross' as const },
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: fgBase, fontSize: 12 },
        extraCssText: 'border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.08);',
        formatter(params: unknown) {
          const list = (Array.isArray(params) ? params : [params]) as Array<{ dataIndex?: number }>
          const idx = list[0]?.dataIndex ?? 0
          const c = candles[idx]
          if (!c) return ''
          const timeStr = new Date(c.time).toLocaleString('ko-KR', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
          return (
            `<div style="font-weight:600;margin-bottom:6px">${timeStr}</div>` +
            `<div style="font-size:11px;color:${fgSubtle}">시 ${c.open} · 고 ${c.high} · 저 ${c.low} · 종 ${c.close} Wh</div>` +
            `<div style="font-size:11px;margin-top:4px">거래량 <b>${c.volume}</b> Wh · ${c.count}회</div>`
          )
        },
      },
      xAxis: [
        {
          type: 'time' as const,
          gridIndex: 0,
          axisLine: { lineStyle: { color: '#7a7a7a' } },
          axisLabel: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
        },
        {
          type: 'time' as const,
          gridIndex: 1,
          axisLine: { lineStyle: { color: '#7a7a7a' } },
          axisLabel: { color: fgSubtle, fontSize: 9 },
          axisTick: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value' as const,
          gridIndex: 0,
          scale: true,
          name: 'Wh',
          nameTextStyle: { color: fgSubtle, fontSize: 10 },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: fgSubtle, fontSize: 10 },
          splitLine: { lineStyle: { type: 'dashed' as const, color: '#f0f0f0' } },
        },
        {
          type: 'value' as const,
          gridIndex: 1,
          scale: true,
          name: 'Vol',
          nameTextStyle: { color: fgSubtle, fontSize: 9 },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: fgSubtle, fontSize: 9, formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)) },
          splitNumber: 2,
          splitLine: { show: false },
        },
      ],
      dataZoom: [
        {
          type: 'inside' as const,
          xAxisIndex: [0, 1],
          start: candles.length > 80 ? Math.max(0, 100 - (80 / candles.length) * 100) : 0,
          end: 100,
        },
      ],
      series: [
        {
          name: '전력',
          type: 'candlestick',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: candleData,
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: upColor,
            borderColor0: downColor,
          },
        },
        {
          name: '거래량',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volumeData,
          barMaxWidth: interval === 'tick' ? 8 : 24,
        },
      ],
    }
  }, [candles, hasData, interval])

  return (
    <div className="border border-border-strong rounded-lg bg-bg-base-opaque p-4">
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1">
          {CANDLE_INTERVAL_TABS.map((t) => (
            <PeriodTabButton
              key={t.key}
              active={interval === t.key}
              onClick={() => setCandleInterval(t.key)}
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
        <ReactECharts option={option} style={{ height: 320 }} opts={{ renderer: 'svg' }} notMerge />
      ) : (
        <div className="h-[320px] flex items-center justify-center text-sm text-fg-muted">
          기록된 데이터가 없습니다
        </div>
      )}
    </div>
  )
}
