import { useState, useMemo } from 'react'
import { Calendar } from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import type { EnergyReading } from '../hooks/useEnergyData'
import {
  getCalendarWeekDays,
  formatDayLabel,
  toDateInputValue,
} from '../lib/presentation'

interface Props {
  readings: EnergyReading[]
  anchorDate: Date
  onAnchorDateChange: (date: Date) => void
}

type ChartTab = 'individual' | 'cumulative'

const CHART_TABS: { key: ChartTab; label: string }[] = [
  { key: 'individual', label: '일별 전력' },
  { key: 'cumulative', label: '주간 누적' },
]

const tooltipBg = '#fff'
const tooltipBorder = 'rgba(42,42,42,0.08)'
const fgBase = '#212121'
const fgSubtle = '#7a7a7a'
const axisLabelColor = fgSubtle
const axisLineColor = '#7a7a7a'
const splitLineColor = '#f0f0f0'

function aggregateWeekDaily(readings: EnergyReading[], weekDays: Date[]) {
  return weekDays.map((day) => {
    const dayStart = new Date(day)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(day)
    dayEnd.setHours(23, 59, 59, 999)

    const inDay = readings.filter((r) => {
      const t = r.timestamp * 1000
      return t >= dayStart.getTime() && t <= dayEnd.getTime()
    })

    const wh = inDay.reduce((s, r) => s + r.wh, 0)
    const kWh = inDay.reduce((s, r) => s + r.kWh, 0)
    return { label: formatDayLabel(day), wh, kWh, count: inDay.length }
  })
}

export default function EnergyChart({ readings, anchorDate, onAnchorDateChange }: Props) {
  const [tab, setTab] = useState<ChartTab>('individual')

  const weekDays = useMemo(() => getCalendarWeekDays(anchorDate), [anchorDate])
  const daily = useMemo(() => aggregateWeekDaily(readings, weekDays), [readings, weekDays])
  const weekLabel = `${formatDayLabel(weekDays[0])} ~ ${formatDayLabel(weekDays[6])}`
  const hasData = daily.some((d) => d.wh > 0)

  const option = useMemo(() => {
    if (!hasData) return {}

    const labels = daily.map((d) => d.label)

    if (tab === 'individual') {
      return {
        grid: { left: 56, right: 16, top: 16, bottom: 32 },
        tooltip: makeTooltip((params: any[]) => {
          const header = `<div style="font-weight:600;font-size:12px;color:${fgBase};margin-bottom:4px">${params[0].axisValueLabel}</div>`
          const rows = params
            .map((p: any) => tooltipRow(p.color, p.seriesName, `${p.value} Wh`))
            .join('')
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
          name: '일별 전력',
          type: 'bar',
          data: daily.map((d) => Number(d.wh.toFixed(2))),
          itemStyle: { color: '#fd4b96', borderRadius: [2, 2, 0, 0] },
          barMaxWidth: 48,
        }],
      }
    }

    const cumKwh = daily.reduce<number[]>((acc, d, i) => {
      acc.push(i === 0 ? d.kWh : +(acc[i - 1] + d.kWh).toFixed(4))
      return acc
    }, [])

    return {
      grid: { left: 56, right: 16, top: 16, bottom: 32 },
      tooltip: makeTooltip((params: any[]) => {
        const header = `<div style="font-weight:600;font-size:12px;color:${fgBase};margin-bottom:4px">${params[0].axisValueLabel}</div>`
        const rows = params
          .map((p: any) => tooltipRow(p.color, p.seriesName, `${p.value} kWh`))
          .join('')
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
  }, [daily, tab, hasData])

  return (
    <div className="border border-border-strong rounded-lg bg-bg-base-opaque p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex gap-1">
          {CHART_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
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

      <p className="text-[10px] text-fg-muted mb-2">{weekLabel} (7일)</p>

      {hasData ? (
        <ReactECharts option={option} style={{ height: 280 }} opts={{ renderer: 'svg' }} />
      ) : (
        <div className="h-[280px] flex items-center justify-center text-sm text-fg-muted">
          선택한 주에 기록된 데이터가 없습니다
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
