import type { EnergyReading } from '../hooks/useEnergyData'
import { sortReadings } from './readingDelta'

export type CandleInterval = 'tick' | '15m' | '30m' | '1h' | '6h' | '12h' | '1d' | '7d'

export interface VolumeBar {
  /** 구간 시작 시각 (ms) */
  time: number
  /** 구간 합계 Wh (전송량) */
  volume: number
  count: number
}

const INTERVAL_MS: Record<Exclude<CandleInterval, 'tick'>, number> = {
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
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

const INTERVAL_LABELS: Record<CandleInterval, string> = {
  tick: '전송별',
  '15m': '15분',
  '30m': '30분',
  '1h': '1시간',
  '6h': '6시간',
  '12h': '12시간',
  '1d': '1일',
  '7d': '7일',
}

export function getVolumeSubtitle(interval: CandleInterval, count: number): string {
  return `${INTERVAL_LABELS[interval]} · ${count}개 구간`
}

export const CANDLE_INTERVAL_TABS: { key: CandleInterval; label: string }[] = [
  { key: 'tick', label: '전송별' },
  { key: '15m', label: '15분' },
  { key: '30m', label: '30분' },
  { key: '1h', label: '1시간' },
  { key: '6h', label: '6시간' },
  { key: '12h', label: '12시간' },
  { key: '1d', label: '1일' },
  { key: '7d', label: '7일' },
]
