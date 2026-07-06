import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import type { EnergyReading } from '../hooks/useEnergyData'
import { PeriodTabButton } from './ChartPeriodCalendar'
import {
  type CandleInterval,
  buildVolumeBars,
  getVolumeSubtitle,
  CANDLE_INTERVAL_TABS,
  type VolumeBar,
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

interface ZoomRange {
  start: number
  end: number
}

const tooltipBg = '#fff'
const tooltipBorder = 'rgba(42,42,42,0.08)'
const fgBase = '#212121'
const fgSubtle = '#7a7a7a'
const barColor = '#fd4b96'
const TWO_HOURS_MS = 2 * 60 * 60 * 1000

/** 전송별: 최근 2시간 / 그 외: 전체 */
function defaultZoomForInterval(barList: VolumeBar[], iv: CandleInterval): ZoomRange {
  if (!barList.length) return { start: 0, end: 100 }

  if (iv === 'tick') {
    const first = barList[0].time
    const last = barList[barList.length - 1].time
    const span = last - first
    if (span <= TWO_HOURS_MS) return { start: 0, end: 100 }
    const windowStart = last - TWO_HOURS_MS
    const start = ((windowStart - first) / span) * 100
    return { start: Math.max(0, start), end: 100 }
  }

  return { start: 0, end: 100 }
}

export default function EnergyChart({ readings, cumulativeBadge }: Props) {
  const [interval, setCandleInterval] = useState<CandleInterval>('tick')
  const userControlledZoom = useRef(false)

  const deltaReadings = useMemo(() => toDeltaReadings(readings), [readings])
  const bars = useMemo(() => buildVolumeBars(deltaReadings, interval), [deltaReadings, interval])
  const subtitle = useMemo(() => getVolumeSubtitle(interval, bars.length), [interval, bars.length])
  const hasData = bars.length > 0

  const [zoom, setZoom] = useState<ZoomRange>({ start: 0, end: 100 })
  const prevBarCountRef = useRef(0)

  const applyDefaultZoom = useCallback((iv: CandleInterval, barList: VolumeBar[]) => {
    userControlledZoom.current = false
    setZoom(defaultZoomForInterval(barList, iv))
  }, [])

  // 주기 탭 변경 시에만 기본 줌으로 리셋
  useEffect(() => {
    if (!bars.length) return
    applyDefaultZoom(interval, bars)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval])

  // 데이터 최초 로드 시 기본 줌 (폴링으로 늘어나도 줌 유지)
  useEffect(() => {
    if (!bars.length) {
      prevBarCountRef.current = 0
      return
    }
    if (prevBarCountRef.current === 0 && !userControlledZoom.current) {
      applyDefaultZoom(interval, bars)
    }
    prevBarCountRef.current = bars.length
  }, [bars, interval, applyDefaultZoom])

  const zoomIn = useCallback(() => {
    userControlledZoom.current = true
    setZoom((prev) => {
      const center = (prev.start + prev.end) / 2
      const span = Math.max(5, (prev.end - prev.start) * 0.65)
      return {
        start: Math.max(0, center - span / 2),
        end: Math.min(100, center + span / 2),
      }
    })
  }, [])

  const zoomOut = useCallback(() => {
    userControlledZoom.current = true
    setZoom((prev) => {
      const center = (prev.start + prev.end) / 2
      const span = Math.min(100, (prev.end - prev.start) / 0.65)
      return {
        start: Math.max(0, center - span / 2),
        end: Math.min(100, center + span / 2),
      }
    })
  }, [])

  const resetZoom = useCallback(() => {
    applyDefaultZoom(interval, bars)
  }, [applyDefaultZoom, interval, bars])

  const handleIntervalChange = useCallback((key: CandleInterval) => {
    setCandleInterval(key)
  }, [])

  const onChartEvents = useMemo(
    () => ({
      datazoom: (e: { batch?: Array<{ start?: number; end?: number }>; start?: number; end?: number }) => {
        const payload = e.batch?.[0] ?? e
        if (payload.start == null || payload.end == null) return
        userControlledZoom.current = true
        setZoom({ start: payload.start, end: payload.end })
      },
    }),
    [],
  )

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
          xAxisIndex: 0,
          filterMode: 'filter' as const,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          moveOnMouseWheel: false,
          preventDefaultMouseMove: true,
          start: zoom.start,
          end: zoom.end,
        },
        {
          type: 'inside' as const,
          yAxisIndex: 0,
          filterMode: 'empty' as const,
          zoomOnMouseWheel: 'shift' as const,
          moveOnMouseMove: 'shift' as const,
          moveOnMouseWheel: false,
          preventDefaultMouseMove: true,
        },
      ],
      series: [
        {
          name: '전송량',
          type: 'bar',
          data: barData,
          itemStyle: { color: barColor },
          barMaxWidth: interval === 'tick' ? 8 : interval === '30d' ? 32 : 24,
        },
      ],
    }
  }, [bars, hasData, interval, zoom.end, zoom.start])

  return (
    <div className="border border-border-strong rounded-lg bg-bg-base-opaque p-4">
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1">
          {CANDLE_INTERVAL_TABS.map((t) => (
            <PeriodTabButton
              key={t.key}
              active={interval === t.key}
              onClick={() => handleIntervalChange(t.key)}
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

      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] text-fg-muted">
          {subtitle}
          {interval === 'tick' ? ' · 기본 최근 2시간' : ''}
        </p>
        {hasData && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={zoomIn}
              className="p-1.5 rounded-md border border-border-strong text-fg-muted hover:text-fg-base hover:bg-bg-subtle transition-colors"
              aria-label="확대"
              title="확대"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={zoomOut}
              className="p-1.5 rounded-md border border-border-strong text-fg-muted hover:text-fg-base hover:bg-bg-subtle transition-colors"
              aria-label="축소"
              title="축소"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="p-1.5 rounded-md border border-border-strong text-fg-muted hover:text-fg-base hover:bg-bg-subtle transition-colors"
              aria-label="기본 보기"
              title={interval === 'tick' ? '최근 2시간' : '전체 보기'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {hasData ? (
        <ReactECharts
          option={option}
          style={{ height: 280 }}
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
  )
}
