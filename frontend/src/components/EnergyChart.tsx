import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from 'lucide-react'
import type { EnergyReading } from '../hooks/useEnergyData'
import { PeriodTabButton } from './ChartPeriodCalendar'
import {
  type CandleInterval,
  buildVolumeBars,
  getVolumeSubtitle,
  getDefaultWindowLabel,
  getNavExtent,
  defaultTimeView,
  clampTimeView,
  getViewRange,
  barsForView,
  CANDLE_INTERVAL_TABS,
  type TimeView,
  BAR_MIN_WIDTH,
  BAR_MAX_WIDTH,
  zoomInView,
  zoomOutView,
} from '../lib/candleAggregation'
import { toDeltaReadings, sortReadings } from '../lib/readingDelta'

interface CumulativeBadge {
  label: string
  kWh: number
  wh?: number
  hint?: string
}

interface Props {
  readings: EnergyReading[]
  cumulativeBadge?: CumulativeBadge
  /** true면 readings가 이미 차분값(생산자 5분 발전량 등) */
  readingsAreDelta?: boolean
  /** 막대·툴팁 라벨 (기본: 전송량) */
  volumeLabel?: string
  /** 확장 모달 제목 */
  chartTitle?: string
}

const tooltipBg = '#fff'
const tooltipBorder = 'rgba(42,42,42,0.08)'
const fgBase = '#212121'
const fgSubtle = '#7a7a7a'
const barColor = '#fd4b96'

function ChartToolButton({
  label,
  title,
  onClick,
  children,
}: {
  label: string
  title: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={label}
      className="flex items-center gap-1 px-2 py-1 rounded-md border border-border-strong text-[10px] font-medium text-fg-muted hover:text-fg-base hover:bg-bg-subtle transition-colors"
    >
      {children}
      <span>{label}</span>
    </button>
  )
}

function formatAxisRange(startMs: number, endMs: number): string {
  const fmt = (ms: number) =>
    new Date(ms).toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  return `${fmt(startMs)} ~ ${fmt(endMs)}`
}

interface ChartPanelProps {
  interval: CandleInterval
  onIntervalChange: (key: CandleInterval) => void
  cumulativeBadge?: CumulativeBadge
  subtitle: string
  viewRangeLabel: string
  hasData: boolean
  option: EChartsOption
  onChartEvents: Record<string, (e: unknown) => void>
  chartHeight: number | string
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onExpand: () => void
  expandLabel?: string
  className?: string
}

function ChartPanel({
  interval,
  onIntervalChange,
  cumulativeBadge,
  subtitle,
  viewRangeLabel,
  hasData,
  option,
  onChartEvents,
  chartHeight,
  onZoomIn,
  onZoomOut,
  onReset,
  onExpand,
  expandLabel = '확장',
  className = '',
}: ChartPanelProps) {
  return (
    <div className={`flex flex-col min-h-0 ${className}`}>
      <div className="flex flex-col gap-2 mb-3 shrink-0">
        <div className="flex flex-wrap items-center gap-1">
          {CANDLE_INTERVAL_TABS.map((t) => (
            <PeriodTabButton
              key={t.key}
              active={interval === t.key}
              onClick={() => onIntervalChange(t.key)}
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

      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 shrink-0">
        <div className="min-w-0">
          <p className="text-[10px] text-fg-muted">{subtitle}</p>
          {hasData && (
            <p className="text-[9px] text-fg-muted/80 font-mono truncate">{viewRangeLabel}</p>
          )}
        </div>
        {hasData && (
          <div className="flex flex-wrap items-center gap-1 shrink-0">
            <ChartToolButton label="확대" title="시간 구간 좁히기" onClick={onZoomIn}>
              <ZoomIn className="w-3.5 h-3.5" />
            </ChartToolButton>
            <ChartToolButton label="축소" title="더 넓은 시간 구간 보기" onClick={onZoomOut}>
              <ZoomOut className="w-3.5 h-3.5" />
            </ChartToolButton>
            <ChartToolButton
              label="기본값"
              title={`${getDefaultWindowLabel(interval)}으로 복원`}
              onClick={onReset}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </ChartToolButton>
            <ChartToolButton label={expandLabel} title="차트 영역 확장" onClick={onExpand}>
              <Maximize2 className="w-3.5 h-3.5" />
            </ChartToolButton>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {hasData ? (
          <ReactECharts
            option={option}
            style={{ height: chartHeight, width: '100%', minHeight: 280 }}
            opts={{ renderer: 'svg' }}
            notMerge
            onEvents={onChartEvents}
          />
        ) : (
          <div className="h-[280px] flex items-center justify-center text-sm text-fg-muted">
            기록된 데이터가 없습니다
          </div>
        )}
      </div>
    </div>
  )
}

export default function EnergyChart({
  readings,
  cumulativeBadge,
  readingsAreDelta = false,
  volumeLabel = '전송량',
  chartTitle = '전력 전송량 차트',
}: Props) {
  const [interval, setCandleInterval] = useState<CandleInterval>('tick')
  const [isExpanded, setIsExpanded] = useState(false)
  const userControlledView = useRef(false)
  const prevBarCountRef = useRef(0)

  const deltaReadings = useMemo(
    () => (readingsAreDelta ? sortReadings(readings) : toDeltaReadings(readings)),
    [readings, readingsAreDelta],
  )
  const rawBars = useMemo(() => buildVolumeBars(deltaReadings, interval), [deltaReadings, interval])
  const extent = useMemo(() => getNavExtent(rawBars), [rawBars])
  const hasData = rawBars.length > 0

  const [timeView, setTimeView] = useState<TimeView>(() => defaultTimeView('tick', Date.now()))

  const applyDefaultView = useCallback((iv: CandleInterval, endMs: number) => {
    userControlledView.current = false
    setTimeView(defaultTimeView(iv, endMs))
  }, [])

  useEffect(() => {
    applyDefaultView(interval, extent.navEndMs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval])

  useEffect(() => {
    if (!rawBars.length) {
      prevBarCountRef.current = 0
      return
    }
    if (prevBarCountRef.current === 0 && !userControlledView.current) {
      applyDefaultView(interval, extent.navEndMs)
    }
    prevBarCountRef.current = rawBars.length
  }, [rawBars.length, interval, extent.navEndMs, applyDefaultView])

  useEffect(() => {
    if (!isExpanded) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isExpanded])

  const clampedView = useMemo(() => clampTimeView(timeView, extent), [timeView, extent])
  const { startMs, endMs } = useMemo(() => getViewRange(clampedView), [clampedView])
  const displayBars = useMemo(
    () => barsForView(rawBars, interval, startMs, endMs),
    [rawBars, interval, startMs, endMs],
  )
  const subtitle = useMemo(() => getVolumeSubtitle(interval, rawBars.length), [interval, rawBars.length])
  const viewRangeLabel = formatAxisRange(startMs, endMs)

  const markUserView = useCallback((updater: (v: TimeView) => TimeView) => {
    userControlledView.current = true
    setTimeView((prev) => updater(prev))
  }, [])

  const zoomIn = useCallback(() => {
    markUserView((v) => zoomInView(v, extent))
  }, [markUserView, extent])

  const zoomOut = useCallback(() => {
    markUserView((v) => zoomOutView(v, extent))
  }, [markUserView, extent])

  const resetView = useCallback(() => {
    applyDefaultView(interval, extent.navEndMs)
  }, [applyDefaultView, interval, extent.navEndMs])

  const onChartEvents = useMemo(
    () => ({
      datazoom: (e: unknown) => {
        const ev = e as {
          batch?: Array<{ startValue?: number; endValue?: number }>
          startValue?: number
          endValue?: number
        }
        const payload = ev.batch?.[0] ?? ev
        if (payload.startValue == null || payload.endValue == null) return
        userControlledView.current = true
        setTimeView(
          clampTimeView(
            {
              viewEndMs: payload.endValue,
              windowMs: payload.endValue - payload.startValue,
            },
            extent,
          ),
        )
      },
    }),
    [extent],
  )

  const option = useMemo((): EChartsOption => {
    if (!hasData) return {}

    const barData = displayBars.map((b) => [b.time, b.volume])

    return {
      animation: false,
      grid: { left: 56, right: 16, top: 20, bottom: 36 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: fgBase, fontSize: 12 },
        extraCssText: 'border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.08);',
        formatter(params: unknown) {
          const list = (Array.isArray(params) ? params : [params]) as Array<{ dataIndex?: number }>
          const idx = list[0]?.dataIndex ?? 0
          const b = displayBars[idx]
          if (!b) return ''
          const timeStr = new Date(b.time).toLocaleString('ko-KR', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
          if (b.volume === 0 && b.count === 0) {
            return `<div style="font-weight:600">${timeStr}</div><div style="font-size:11px;color:${fgSubtle}">기록 없음</div>`
          }
          return (
            `<div style="font-weight:600;margin-bottom:6px">${timeStr}</div>` +
            `<div>${volumeLabel} <b>${b.volume.toLocaleString()}</b> Wh</div>` +
            `<div style="font-size:11px;color:${fgSubtle};margin-top:4px">${b.count}회</div>`
          )
        },
      },
      xAxis: {
        type: 'time',
        min: extent.navStartMs,
        max: extent.navEndMs,
        axisLine: { lineStyle: { color: '#7a7a7a' } },
        axisLabel: { color: fgSubtle, fontSize: 9 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        name: 'Wh',
        nameTextStyle: { color: fgSubtle, fontSize: 10 },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: fgSubtle, fontSize: 10 },
        splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          filterMode: 'none',
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          moveOnMouseWheel: false,
          preventDefaultMouseMove: true,
          minValueSpan: 15 * 60 * 1000,
          startValue: startMs,
          endValue: endMs,
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          filterMode: 'none',
          zoomOnMouseWheel: 'shift',
          moveOnMouseMove: 'shift',
          moveOnMouseWheel: false,
          preventDefaultMouseMove: true,
        },
      ],
      series: [
        {
          name: volumeLabel,
          type: 'bar',
          data: barData,
          itemStyle: { color: barColor },
          barMinWidth: BAR_MIN_WIDTH,
          barMaxWidth: BAR_MAX_WIDTH,
        },
      ],
    }
  }, [displayBars, extent.navEndMs, extent.navStartMs, hasData, startMs, endMs, volumeLabel])

  const panelProps: ChartPanelProps = {
    interval,
    onIntervalChange: setCandleInterval,
    cumulativeBadge,
    subtitle,
    viewRangeLabel,
    hasData,
    option,
    onChartEvents,
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    onReset: resetView,
    onExpand: () => setIsExpanded(true),
    chartHeight: 280,
  }

  const expandedPanel = isExpanded
    ? createPortal(
        <div className="fixed inset-0 z-50 flex flex-col bg-bg-base/95 backdrop-blur-sm">
          <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-border-strong bg-bg-base-opaque">
            <div>
              <h2 className="text-sm font-bold text-fg-base">{chartTitle}</h2>
              <p className="text-[10px] text-fg-muted mt-0.5">{viewRangeLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-strong text-xs font-medium text-fg-muted hover:text-fg-base hover:bg-bg-subtle transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
              축소
            </button>
          </div>
          <div className="flex-1 min-h-0 p-4 overflow-hidden">
            <div className="h-full border border-border-strong rounded-lg bg-bg-base-opaque p-4 flex flex-col">
              <ChartPanel
                {...panelProps}
                chartHeight="100%"
                expandLabel="축소"
                onExpand={() => setIsExpanded(false)}
                className="h-full"
              />
            </div>
          </div>
        </div>,
        document.body,
      )
    : null

  return (
    <>
      <div className="border border-border-strong rounded-lg bg-bg-base-opaque p-4">
        <ChartPanel {...panelProps} />
      </div>
      {expandedPanel}
    </>
  )
}
