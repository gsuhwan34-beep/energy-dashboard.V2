import type { EnergyReading } from '../hooks/useEnergyData'
import { sortReadings } from './readingDelta'

export type CandleInterval = 'tick' | '15m' | '30m' | '1h' | '6h' | '12h' | '1d' | '7d'

export interface OhlcvCandle {
  /** 버킷 시작 시각 (ms) */
  time: number
  open: number
  high: number
  low: number
  close: number
  /** 구간 합계 Wh (거래량) */
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

function bucketToCandle(time: number, items: EnergyReading[]): OhlcvCandle {
  const whs = items.map((r) => r.wh)
  const volume = whs.reduce((s, v) => s + v, 0)
  return {
    time,
    open: whs[0],
    high: Math.max(...whs),
    low: Math.min(...whs),
    close: whs[whs.length - 1],
    volume: Number(volume.toFixed(4)),
    count: items.length,
  }
}

/** 전송(틱)별 — 막대·봉 1:1 대응 */
export function aggregateTickCandles(readings: EnergyReading[]): OhlcvCandle[] {
  return sortReadings(readings).map((r) => ({
    time: r.timestamp * 1000,
    open: r.wh,
    high: r.wh,
    low: r.wh,
    close: r.wh,
    volume: r.wh,
    count: 1,
  }))
}

/** 주기별 OHLCV 롤업 */
export function aggregateOhlcvCandles(
  readings: EnergyReading[],
  interval: Exclude<CandleInterval, 'tick'>,
): OhlcvCandle[] {
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
    .map(([time, items]) => bucketToCandle(time, items))
}

export function buildCandles(readings: EnergyReading[], interval: CandleInterval): OhlcvCandle[] {
  if (!readings.length) return []
  if (interval === 'tick') return aggregateTickCandles(readings)
  return aggregateOhlcvCandles(readings, interval)
}

const INTERVAL_LABELS: Record<CandleInterval, string> = {
  tick: '전송별 (틱)',
  '15m': '15분봉',
  '30m': '30분봉',
  '1h': '1시간봉',
  '6h': '6시간봉',
  '12h': '12시간봉',
  '1d': '1일봉',
  '7d': '7일봉',
}

export function getCandleSubtitle(interval: CandleInterval, count: number): string {
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
