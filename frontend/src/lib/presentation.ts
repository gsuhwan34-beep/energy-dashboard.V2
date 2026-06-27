import type { EnergyReading, SettlementTransfer } from '../hooks/useEnergyData'
import type { VerifiedProducerSale } from '../hooks/useProducerData'
import { PRESET_SETTLEMENT_RATES } from '../hooks/useWallet'

export const STORAGE_CONSUMER_WALLET = 'emeter:consumer-wallet'
export const STORAGE_PRODUCER_WALLET = 'emeter:producer-wallet'

export const DEMO_CONSUMER_WALLET = '0x6220F267AEDfB782d8aDD9D13AAB3f5B51c0b3c5'

export interface HourCell {
  hour: number
  wh: number
  count: number
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const EPOCH_START_MS = new Date('2026-05-04T00:00:00+09:00').getTime()

export function readStoredWallet(key: string, fallback = ''): string {
  try {
    return localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

export function writeStoredWallet(key: string, wallet: string) {
  try {
    if (/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      localStorage.setItem(key, wallet)
    }
  } catch {
    // ignore
  }
}

export function buildDailyHeatmap(readings: EnergyReading[], date: Date): HourCell[] {
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const cells: HourCell[] = []

  for (let h = 0; h < 24; h++) {
    const start = new Date(dayStart)
    start.setHours(h, 0, 0, 0)
    const end = new Date(dayStart)
    end.setHours(h + 1, 0, 0, 0)

    const inHour = readings.filter((r) => {
      const t = r.timestamp * 1000
      return t >= start.getTime() && t < end.getTime()
    })

    cells.push({
      hour: h,
      wh: inHour.reduce((s, r) => s + r.wh, 0),
      count: inHour.length,
    })
  }
  return cells
}

export function heatmapColor(wh: number, maxWh: number): string {
  if (wh <= 0) return 'rgba(148,163,184,0.12)'
  const t = Math.min(1, wh / Math.max(maxWh, 1))
  if (t < 0.25) return `rgba(52, 211, 153, ${0.35 + t * 0.5})`
  if (t < 0.5) return `rgba(34, 197, 94, ${0.45 + t * 0.45})`
  if (t < 0.75) return `rgba(251, 191, 36, ${0.55 + t * 0.35})`
  return `rgba(239, 68, 68, ${0.7 + t * 0.3})`
}

export function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr || '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function getWeekIndex(timestamp: number): number {
  return Math.floor((timestamp * 1000 - EPOCH_START_MS) / WEEK_MS)
}

function getWeekStart(weekIndex: number): Date {
  return new Date(EPOCH_START_MS + weekIndex * WEEK_MS)
}

function getWeekEnd(weekIndex: number): Date {
  return new Date(EPOCH_START_MS + (weekIndex + 1) * WEEK_MS - 1)
}

function amountsMatch(expected: number, actual: number): boolean {
  if (expected <= 0) return actual <= 0.01
  return Math.abs(expected - actual) <= Math.max(0.01, expected * 0.05)
}

function groupWeekKwh(readings: EnergyReading[]) {
  const map: Record<number, number> = {}
  for (const r of readings) {
    const idx = getWeekIndex(r.timestamp)
    map[idx] = (map[idx] ?? 0) + r.kWh
  }
  return map
}

export interface EnrichedSettlement {
  txHash: string
  timestamp: number
  wonAmount: number
  kWh: number | null
  ratePerKwh: number | null
  weekLabel: string | null
}

export function enrichConsumerSettlements(
  readings: EnergyReading[],
  transfers: SettlementTransfer[],
  extraRates: number[] = [],
): EnrichedSettlement[] {
  const weekKwh = groupWeekKwh(readings)
  const rates = [...new Set([...PRESET_SETTLEMENT_RATES, ...extraRates.filter((r) => r > 0)])]
  const used = new Set<string>()

  const weeks = Object.keys(weekKwh)
    .map(Number)
    .sort((a, b) => a - b)

  const enriched: EnrichedSettlement[] = []

  for (const t of [...transfers].sort((a, b) => a.timestamp - b.timestamp)) {
    let matched: EnrichedSettlement = {
      txHash: t.txHash,
      timestamp: t.timestamp,
      wonAmount: t.wonAmount,
      kWh: null,
      ratePerKwh: null,
      weekLabel: null,
    }

    for (const idx of weeks) {
      const kWh = weekKwh[idx]
      if (kWh <= 0) continue
      const weekStartTs = Math.floor(getWeekStart(idx).getTime() / 1000)
      if (t.timestamp < weekStartTs) continue

      let ok = false
      let rate = 0
      for (const r of rates) {
        if (amountsMatch(kWh * r, t.wonAmount)) {
          ok = true
          rate = r
          break
        }
      }
      if (!ok) {
        const implied = t.wonAmount / kWh
        if (implied >= 10 && implied <= 500 && amountsMatch(kWh * implied, t.wonAmount)) {
          ok = true
          rate = Number(implied.toFixed(2))
        }
      }
      if (!ok || used.has(`${idx}-${t.txHash}`)) continue

      const start = getWeekStart(idx)
      const end = getWeekEnd(idx)
      matched = {
        txHash: t.txHash,
        timestamp: t.timestamp,
        wonAmount: t.wonAmount,
        kWh,
        ratePerKwh: rate,
        weekLabel: `${start.getMonth() + 1}/${start.getDate()} ~ ${end.getMonth() + 1}/${end.getDate()}`,
      }
      used.add(`${idx}-${t.txHash}`)
      break
    }

    enriched.push(matched)
  }

  return enriched.sort((a, b) => b.timestamp - a.timestamp)
}

export function toDateInputValue(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export type { VerifiedProducerSale }
