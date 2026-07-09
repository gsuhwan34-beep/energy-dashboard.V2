import type { EnergyReading } from '../hooks/useEnergyData'
import { sortReadings } from './readingDelta'

export type CandleInterval = 'tick' | '15m' | '30m' | '1h' | '6h' | '12h' | '1d'

export interface VolumeBar {
  time: number
  volume: number
  count: number
}

export interface TimeView {
  viewEndMs: number
  windowMs: number
}

export interface NavExtent {
  navStartMs: number
  navEndMs: number
}

const H = 60 * 60 * 1000
const D = 24 * H

export const MAX_NAV_HISTORY_MS = 90 * D

/** 전송별(tick) — 항상 최근 20분 구간 */
export const TICK_WINDOW_MS = 20 * 60 * 1000

/** 전송별 1분 슬롯 — 막대 균등 배치 */
export const TICK_SLOT_MS = 60 * 1000

export const DEFAULT_WINDOW_MS: Record<CandleInterval, number> = {
  tick: TICK_WINDOW_MS,
  '15m': 12 * H,
  '30m': 24 * H,
  '1h': 48 * H,
  '6h': 7 * D,
  '12h': 14 * D,
  '1d': 28 * D,
}

const DEFAULT_WINDOW_LABELS: Record<CandleInterval, string> = {
  tick: '최근 20분',
  '15m': '최근 12시간',
  '30m': '최근 24시간',
  '1h': '최근 48시간',
  '6h': '최근 1주',
  '12h': '최근 2주',
  '1d': '최근 4주',
}

export const INTERVAL_BUCKET_MS: Record<Exclude<CandleInterval, 'tick'>, number> = {
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
}

const MIN_VIEW_MS = 15 * 60 * 1000

function floorTime(tsMs: number, intervalMs: number): number {
  return Math.floor(tsMs / intervalMs) * intervalMs
}

function bucketToBar(time: number, items: EnergyReading[]): VolumeBar {
  const volume = items.reduce((s, r) => s + r.wh, 0)
  return {
    time,
    volume: Number(volume.toFixed(4)),
    count: items.length,
  }
}

export function aggregateTickBars(readings: EnergyReading[]): VolumeBar[] {
  return sortReadings(readings).map((r) => ({
    time: r.timestamp * 1000,
    volume: r.wh,
    count: 1,
  }))
}

export function aggregateIntervalBars(
  readings: EnergyReading[],
  interval: Exclude<CandleInterval, 'tick'>,
): VolumeBar[] {
  const intervalMs = INTERVAL_BUCKET_MS[interval]
  const sorted = sortReadings(readings)
  const map = new Map<number, EnergyReading[]>()

  for (const r of sorted) {
    const key = floorTime(r.timestamp * 1000, intervalMs)
    const list = map.get(key) ?? []
    list.push(r)
    map.set(key, list)
  }

  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([time, items]) => bucketToBar(time, items))
}

export function buildVolumeBars(readings: EnergyReading[], interval: CandleInterval): VolumeBar[] {
  if (!readings.length) return []
  if (interval === 'tick') return aggregateTickBars(readings)
  return aggregateIntervalBars(readings, interval)
}

export function getNavExtent(bars: VolumeBar[]): NavExtent {
  const now = Date.now()
  const lastBar = bars.length ? bars[bars.length - 1].time : now
  const firstBar = bars.length ? bars[0].time : now - MAX_NAV_HISTORY_MS
  const navEndMs = Math.max(lastBar, now)
  const navStartMs = Math.min(firstBar - H, navEndMs - MAX_NAV_HISTORY_MS)
  return { navStartMs, navEndMs }
}

/** 실시간(최근 전송)이면 지금, 과거 기록만 있으면 마지막 전송 시각 기준 */
export function tickViewEndMs(bars: VolumeBar[]): number {
  if (!bars.length) return Date.now()
  const lastBar = bars[bars.length - 1].time
  const isLive = Date.now() - lastBar <= TICK_WINDOW_MS * 2
  return isLive ? Date.now() : lastBar
}

export function defaultTimeView(interval: CandleInterval, extent: NavExtent, bars: VolumeBar[]): TimeView {
  if (interval === 'tick') {
    return {
      viewEndMs: tickViewEndMs(bars),
      windowMs: TICK_WINDOW_MS,
    }
  }

  return {
    viewEndMs: extent.navEndMs,
    windowMs: DEFAULT_WINDOW_MS[interval],
  }
}

export function clampTimeView(view: TimeView, extent: NavExtent): TimeView {
  const maxWindow = extent.navEndMs - extent.navStartMs
  let windowMs = Math.min(maxWindow, Math.max(MIN_VIEW_MS, view.windowMs))
  let viewEndMs = Math.min(extent.navEndMs, Math.max(extent.navStartMs + windowMs, view.viewEndMs))
  let viewStartMs = viewEndMs - windowMs
  if (viewStartMs < extent.navStartMs) {
    viewStartMs = extent.navStartMs
    viewEndMs = viewStartMs + windowMs
  }
  return { viewEndMs, windowMs: viewEndMs - viewStartMs }
}

export function getViewRange(view: TimeView): { startMs: number; endMs: number } {
  return { startMs: view.viewEndMs - view.windowMs, endMs: view.viewEndMs }
}

/** 전송별 — 보이는 구간을 고정 간격 슬롯으로 채워 막대 간격 균등 */
export function barsForTickView(
  rawBars: VolumeBar[],
  viewStartMs: number,
  viewEndMs: number,
  slotMs = TICK_SLOT_MS,
): VolumeBar[] {
  const map = new Map<number, VolumeBar>()
  for (const b of rawBars) {
    if (b.time < viewStartMs || b.time > viewEndMs) continue
    const slot = floorTime(b.time, slotMs)
    const existing = map.get(slot)
    if (existing) {
      map.set(slot, {
        time: slot,
        volume: Number((existing.volume + b.volume).toFixed(4)),
        count: existing.count + b.count,
      })
    } else {
      map.set(slot, { time: slot, volume: b.volume, count: b.count })
    }
  }

  const result: VolumeBar[] = []
  let t = floorTime(viewStartMs, slotMs)
  const end = floorTime(viewEndMs, slotMs)
  while (t <= end) {
    result.push(map.get(t) ?? { time: t, volume: 0, count: 0 })
    t += slotMs
  }
  return result
}

export function barsForView(
  rawBars: VolumeBar[],
  interval: CandleInterval,
  viewStartMs: number,
  viewEndMs: number,
): VolumeBar[] {
  if (interval === 'tick') {
    return barsForTickView(rawBars, viewStartMs, viewEndMs)
  }

  const bucketMs = INTERVAL_BUCKET_MS[interval]
  const map = new Map(rawBars.map((b) => [b.time, b]))
  const result: VolumeBar[] = []
  let t = floorTime(viewStartMs, bucketMs)
  const end = floorTime(viewEndMs, bucketMs)

  while (t <= end) {
    result.push(map.get(t) ?? { time: t, volume: 0, count: 0 })
    t += bucketMs
  }
  return result
}

export function getDefaultWindowLabel(iv: CandleInterval): string {
  return DEFAULT_WINDOW_LABELS[iv]
}

const INTERVAL_LABELS: Record<CandleInterval, string> = {
  tick: '전송별',
  '15m': '15분',
  '30m': '30분',
  '1h': '1시간',
  '6h': '6시간',
  '12h': '12시간',
  '1d': '1일',
}

export function getVolumeSubtitle(interval: CandleInterval, count: number): string {
  return `${INTERVAL_LABELS[interval]} · ${count}개 구간 · ${getDefaultWindowLabel(interval)}`
}

export const CANDLE_INTERVAL_TABS: { key: CandleInterval; label: string }[] = [
  { key: 'tick', label: '전송별' },
  { key: '15m', label: '15분' },
  { key: '30m', label: '30분' },
  { key: '1h', label: '1시간' },
  { key: '6h', label: '6시간' },
  { key: '12h', label: '12시간' },
  { key: '1d', label: '1일' },
]

export const BAR_MIN_WIDTH = 10
export const BAR_MAX_WIDTH = 40

export const ZOOM_FACTOR = 1.35

export const EXPAND_WINDOW_FACTOR = 2

export function expandWindowView(view: TimeView, extent: NavExtent): TimeView {
  return clampTimeView(
    { viewEndMs: view.viewEndMs, windowMs: view.windowMs * EXPAND_WINDOW_FACTOR },
    extent,
  )
}

export function zoomInView(view: TimeView, extent: NavExtent): TimeView {
  const nextWindow = Math.max(MIN_VIEW_MS, view.windowMs / ZOOM_FACTOR)
  return clampTimeView({ viewEndMs: view.viewEndMs, windowMs: nextWindow }, extent)
}

export function zoomOutView(view: TimeView, extent: NavExtent): TimeView {
  const maxWindow = extent.navEndMs - extent.navStartMs
  const atMaxWindow = view.windowMs >= maxWindow * 0.995

  if (atMaxWindow) {
    const panStep = view.windowMs * 0.3
    const viewStart = view.viewEndMs - view.windowMs
    if (viewStart - panStep >= extent.navStartMs) {
      return clampTimeView({ viewEndMs: view.viewEndMs - panStep, windowMs: view.windowMs }, extent)
    }
    return clampTimeView({ viewEndMs: extent.navStartMs + view.windowMs, windowMs: view.windowMs }, extent)
  }

  const nextWindow = Math.min(maxWindow, view.windowMs * ZOOM_FACTOR)
  return clampTimeView({ viewEndMs: view.viewEndMs, windowMs: nextWindow }, extent)
}
