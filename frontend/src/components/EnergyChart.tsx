import { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EnergyReading } from '../hooks/useEnergyData'

interface Props {
  readings: EnergyReading[]
}

type ChartTab = 'individual' | 'cumulative'
type TimeRange = '1D' | '7D' | '30D' | '1Y' | '5Y'

const CHART_TABS: { key: ChartTab; label: string }[] = [
  { key: 'individual', label: '계량 전력' },
  { key: 'cumulative', label: '누적 전력량' },
]

const TIME_RANGES: TimeRange[] = ['1D', '7D', '30D', '1Y', '5Y']

const RANGE_MS: Record<TimeRange, number> = {
  '1D': 86400_000,
  '7D': 7 * 86400_000,
  '30D': 30 * 86400_000,
  '1Y': 365 * 86400_000,
  '5Y': 5 * 365 * 86400_000,
}

// Light theme chart vars
const tooltipBg = '#fff'
const tooltipBorder = 'rgba(42,42,42,0.08)'
const fgBase = '#212121'
const fgSubtle = '#7a7a7a'
const axisLabelColor = fgSubtle
const axisLineColor = '#7a7a7a'
const splitLineColor = '#f0f0f0'

export default function EnergyChart({ readings }: Props) {
  const [tab, setTab] = useState<ChartTab>('individual')
  const [range, setRange] = useState<TimeRange>('5Y')

  const filtered = useMemo(() => {
    if (!readings.length) return []
    const cutoff = Date.now() - RANGE_MS[range]
    return readings.filter(r => r.timestamp * 1000 >= cutoff)
  }, [readings, range])

  const option = useMemo(() => {
    if (!filtered.length) return {}

    const labels = filtered.map(r => {
      const d = new Date(r.timestamp * 1000)
      return d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    })

    if (tab === 'individual') {
      return {
        grid: { left: 56, right: 16, top: 16, bottom: 32 },
        tooltip: makeTooltip((params: any[]) => {
          const header = `<div style="font-weight:600;font-size:12px;color:${fgBase};margin-bottom:4px">${params[0].axisValueLabel}</div>`
          const rows = params.map((p: any) =>
            tooltipRow(p.color, p.seriesName, `${p.value} Wh`)
          ).join('')
          return header + rows
        }),
        xAxis: makeXAxis(labels),
        yAxis: {
          type: 'value' as const,
          name: 'Wh',
          nameTextStyle: { color: fgSubtle, fontSize: 10 },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: axisLabelColor, fontSize: 10 },
          splitLine: { lineStyle: { type: 'dashed' as const, color: splitLineColor } },
        },
        series: [{
          name: '계량 전력',
          type: 'bar',
          data: filtered.map(r => r.wh),
          itemStyle: { color: '#fd4b96', borderRadius: [2, 2, 0, 0] },
          barMaxWidth: 40,
        }],
      }
    }

    // Cumulative
    const cumKwh = filtered.reduce<number[]>((acc, r, i) => {
      acc.push(i === 0 ? r.kWh : +(acc[i - 1] + r.kWh).toFixed(4))
      return acc
    }, [])

    return {
      grid: { left: 56, right: 16, top: 16, bottom: 32 },
      tooltip: makeTooltip((params: any[]) => {
        const header = `<div style="font-weight:600;font-size:12px;color:${fgBase};margin-bottom:4px">${params[0].axisValueLabel}</div>`
        const rows = params.map((p: any) =>
          tooltipRow(p.color, p.seriesName, `${p.value} kWh`)
        ).join('')
        return header + rows
      }),
      xAxis: makeXAxis(labels),
      yAxis: {
        type: 'value' as const,
        name: 'kWh',
        nameTextStyle: { color: fgSubtle, fontSize: 10 },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: axisLabelColor, fontSize: 10, formatter: (v: number) => v.toFixed(2) },
        splitLine: { lineStyle: { type: 'dashed' as const, color: splitLineColor } },
      },
      series: [{
        name: '누적 전력량',
        type: 'line',
        data: cumKwh,
        symbol: 'circle',
        symbolSize: 6,
        smooth: false,
        lineStyle: { width: 1.5, color: '#6366f1' },
        itemStyle: { color: '#6366f1' },
        areaStyle: { color: 'rgba(99,102,241,0.08)' },
      }],
    }
  }, [filtered, tab])

  return (
    <div className="border border-border-strong rounded-lg bg-bg-base-opaque p-4">
      {/* 상단: 차트 타입 탭 + 기간 탭 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        {/* 차트 타입 */}
        <div className="flex gap-1">
          {CHART_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                tab === t.key
                  ? 'bg-brand-10 text-brand-100'
                  : 'text-fg-muted hover:text-fg-subtle hover:bg-bg-subtle'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 기간 */}
        <div className="flex gap-1">
          {TIME_RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                range === r
                  ? 'bg-brand-100 text-white'
                  : 'text-fg-muted hover:text-fg-subtle'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 차트 */}
      {filtered.length > 0 ? (
        <ReactECharts option={option} style={{ height: 280 }} opts={{ renderer: 'svg' }} />
      ) : (
        <div className="h-[280px] flex items-center justify-center text-sm text-fg-muted">
          해당 기간에 기록된 데이터가 없습니다
        </div>
      )}
    </div>
  )
}

function makeXAxis(data: string[]) {
  return {
    type: 'category' as const,
    data,
    axisLine: { show: true, lineStyle: { color: axisLineColor, width: 1 } },
    axisLabel: { color: axisLabelColor, fontSize: 10 },
    axisTick: { show: false },
  }
}

function makeTooltip(formatter: (params: any[]) => string) {
  return {
    trigger: 'axis' as const,
    backgroundColor: tooltipBg,
    borderColor: tooltipBorder,
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: fgBase, fontSize: 12 },
    transitionDuration: 0.15,
    extraCssText: 'border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.08);',
    formatter,
  }
}

function tooltipRow(color: string, name: string, value: string) {
  return (
    `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px">` +
      `<div style="display:flex;align-items:center;gap:6px">` +
        `<span style="display:inline-block;width:12px;height:2.5px;border-radius:1px;background:${color}"></span>` +
        `<span style="color:${fgSubtle};font-size:12px">${name}</span>` +
      `</div>` +
      `<span style="font-weight:600;font-size:12px;color:${fgBase}">${value}</span>` +
    `</div>`
  )
}
