import type { EnergyReading } from '../hooks/useEnergyData'
import { sortReadings } from './readingDelta'

export type CandleInterval = 'tick' | '15m' | '30m' | '1h' | '6h' | '12h' | '1d'

export interface VolumeBar {
  /** 구간 시작 시각 (ms) */
  time: number
  /** 구간 합계 Wh (전송량) */
  volume: number
  count: number
}

export interface ZoomRange {
  start: number
  end: number
}

const H = 60 * 60 * 1000
const D = 24 * H

/** 주기별 기본 가로축 창 (막대 밀도를 일정하게 유지) */
export const DEFAULT_WINDOW_MS: Record<CandleInterval, number> = {
  tick: 2 * H,
  '15m': 12 * H,
  '30m': 24 * H,
  '1h': 48 * H,
  '6h': 7 * D,
  '12h': 14 * D,
  '1d': 28 * D,
}

const DEFAULT_WINDOW_LABELS: Record<CandleInterval, string> = {
  tick: '최근 2시간',
  '15m': '최근 12시간',
  '30m': '최근 24시간',
  '1h': '최근 48시간',
  '6h': '최근 1주',
  '12h': '최근 2주',
  '1d': '최근 4주',
}

const INTERVAL_MS: Record<Exclude<CandleInterval, 'tick'>, number> = {
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
}

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

/** 전송(틱)별 — 막대 1:1 대응 */
export function aggregateTickBars(readings: EnergyReading[]): VolumeBar[] {
  return sortReadings(readings).map((r) => ({
    time: r.timestamp * 1000,
    volume: r.wh,
    count: 1,
  }))
}

/** 주기별 전송량 합산 */
export function aggregateIntervalBars(
  readings: EnergyReading[],
  interval: Exclude<CandleInterval, 'tick'>,
): VolumeBar[] {
  const intervalMs = INTERVAL_MS[interval]
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

/** 주기별 기본 줌 — 데이터 끝(최신) 기준 최근 N시간/일 */
export function defaultZoomForBars(barList: VolumeBar[], iv: CandleInterval): ZoomRange {
  if (!barList.length) return { start: 0, end: 100 }

  const first = barList[0].time
  const last = barList[barList.length - 1].time
  const span = last - first
  if (span <= 0) return { start: 0, end: 100 }

  const windowMs = DEFAULT_WINDOW_MS[iv]
  if (span <= windowMs) return { start: 0, end: 100 }

  const windowStart = last - windowMs
  const start = ((windowStart - first) / span) * 100
  return { start: Math.max(0, start), end: 100 }
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

/** 막대 두께 — 주기와 무관하게 잘 보이도록 */
export const BAR_MIN_WIDTH = 10
export const BAR_MAX_WIDTH = 40
