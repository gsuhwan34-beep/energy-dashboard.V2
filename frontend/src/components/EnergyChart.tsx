import { useState, useMemo, useCallback } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EnergyReading } from '../hooks/useEnergyData'
import ChartPeriodCalendar, { PeriodTabButton } from './ChartPeriodCalendar'
import {
  type ChartPeriodMode,
  aggregateDayTx,
  aggregateWeek7Days,
  aggregateMonth8Weeks,
  aggregateYear12Months,
  getPeriodSubtitle,
  snapAnchorForMode,
  getWeekMonday,
} from '../lib/chartAggregation'

interface Props {
  readings: EnergyReading[]
  anchorDate: Date
  onAnchorDateChange: (date: Date) => void
}

type ChartTab = 'individual' | 'cumulative'

const PERIOD_TABS: { key: ChartPeriodMode; label: string }[] = [
  { key: 'day', label: '일별' },
  { key: 'week', label: '주별' },
  { key: 'month', label: '월별' },
  { key: 'year', label: '연별' },
]

const CHART_TABS: { key: ChartTab; label: string }[] = [
  { key: 'individual', label: '계량 전력' },
  { key: 'cumulative', label: '누적 전력량' },
]

const tooltipBg = '#fff'
const tooltipBorder = 'rgba(42,42,42,0.08)'
const fgBase = '#212121'
const fgSubtle = '#7a7a7a'
const axisLabelColor = fgSubtle
const axisLineColor = '#7a7a7a'
const splitLineColor = '#f0f0f0'

export default function EnergyChart({ readings, anchorDate, onAnchorDateChange }: Props) {
  const [periodMode, setPeriodMode] = useState<ChartPeriodMode>('day')
  const [chartTab, setChartTab] = useState<ChartTab>('individual')

  const handlePeriodChange = useCallback(
    (mode: ChartPeriodMode) => {
      setPeriodMode(mode)
      onAnchorDateChange(snapAnchorForMode(mode, anchorDate))
    },
    [anchorDate, onAnchorDateChange],
  )

  const buckets = useMemo(() => {
    switch (periodMode) {
      case 'day':
        return aggregateDayTx(readings, anchorDate)
      case 'week':
        return aggregateWeek7Days(readings, anchorDate)
      case 'month':
        return aggregateMonth8Weeks(readings, getWeekMonday(anchorDate))
      case 'year':
        return aggregateYear12Months(readings, anchorDate)
      default:
        return []
    }
  }, [readings, anchorDate, periodMode])

  const subtitle = useMemo(
    () => getPeriodSubtitle(periodMode, anchorDate, periodMode === 'day' ? buckets.length : undefined),
    [periodMode, anchorDate, buckets.length],
  )

  const hasData = buckets.some((b) => b.wh > 0 || b.count > 0)
  const rotateLabels = periodMode === 'day'

  const option = useMemo(() => {
    if (!hasData) return {}

    const labels = buckets.map((b) => b.label)
    const barMaxWidth = periodMode === 'day' ? 24 : 48

    if (chartTab === 'individual') {
      return {
        grid: { left: 56, right: 16, top: 16, bottom: rotateLabels ? 48 : 32 },
        tooltip: makeTooltip((params: any[]) => {
          const idx = params[0]?.dataIndex ?? 0
          const b = buckets[idx]
          const header = `<div style="font-weight:600;font-size:12px;color:${fgBase};margin-bottom:4px">${params[0].axisValueLabel}</div>`
          const rows = params
            .map((p: any) => tooltipRow(p.color, p.seriesName, `${p.value} Wh`))
            .join('')
          const extra = b?.count ? `<div style="font-size:11px;color:${fgSubtle};margin-top:4px">${b.count}회 계량</div>` : ''
          return header + rows + extra
        }),
        xAxis: makeXAxis(labels, rotateLabels),
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
          data: buckets.map((b) => b.wh),
          itemStyle: { color: '#fd4b96', borderRadius: [2, 2, 0, 0] },
          barMaxWidth,
        }],
      }
    }

    const cumKwh = buckets.reduce<number[]>((acc, b, i) => {
      acc.push(i === 0 ? b.kWh : +(acc[i - 1] + b.kWh).toFixed(4))
      return acc
    }, [])

    return {
      grid: { left: 56, right: 16, top: 16, bottom: rotateLabels ? 48 : 32 },
      tooltip: makeTooltip((params: any[]) => {
        const header = `<div style="font-weight:600;font-size:12px;color:${fgBase};margin-bottom:4px">${params[0].axisValueLabel}</div>`
        const rows = params
          .map((p: any) => tooltipRow(p.color, p.seriesName, `${p.value} kWh`))
          .join('')
        return header + rows
      }),
      xAxis: makeXAxis(labels, rotateLabels),
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
        symbolSize: periodMode === 'day' ? 4 : 6,
        smooth: false,
        lineStyle: { width: 1.5, color: '#6366f1' },
        itemStyle: { color: '#6366f1' },
        areaStyle: { color: 'rgba(99,102,241,0.08)' },
      }],
    }
  }, [buckets, chartTab, hasData, periodMode, rotateLabels])

  return (
    <div className="border border-border-strong rounded-lg bg-bg-base-opaque p-4">
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1">
          {PERIOD_TABS.map((t) => (
            <PeriodTabButton
              key={t.key}
              active={periodMode === t.key}
              onClick={() => handlePeriodChange(t.key)}
            >
              {t.label}
            </PeriodTabButton>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex gap-1">
            {CHART_TABS.map((t) => (
              <PeriodTabButton
                key={t.key}
                active={chartTab === t.key}
                onClick={() => setChartTab(t.key)}
              >
                {t.label}
              </PeriodTabButton>
            ))}
          </div>
          <ChartPeriodCalendar
            periodMode={periodMode}
            value={anchorDate}
            onChange={onAnchorDateChange}
          />
        </div>
      </div>

      <p className="text-[10px] text-fg-muted mb-2">{subtitle}</p>

      {hasData ? (
        <ReactECharts option={option} style={{ height: 280 }} opts={{ renderer: 'svg' }} notMerge />
      ) : (
        <div className="h-[280px] flex items-center justify-center text-sm text-fg-muted">
          선택한 기간에 기록된 데이터가 없습니다
        </div>
      )}
    </div>
  )
}

function makeXAxis(data: string[], rotate = false) {
  return {
    type: 'category' as const,
    data,
    axisLine: { show: true, lineStyle: { color: axisLineColor, width: 1 } },
    axisLabel: {
      color: axisLabelColor,
      fontSize: 9,
      rotate: rotate ? 45 : 0,
      interval: rotate ? 'auto' as const : 0,
    },
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
