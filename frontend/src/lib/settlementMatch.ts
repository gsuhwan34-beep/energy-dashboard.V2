import type { EnergyReading, SettlementTransfer } from '../hooks/useEnergyData'
import { PRESET_SETTLEMENT_RATES } from '../hooks/useWallet'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const EPOCH_START = new Date('2026-05-04T00:00:00+09:00')

export interface WeekRow {
  weekIndex: number
  weekLabel: string
  start: Date
  end: Date
  totalWh: number
  totalKWh: number
  isCurrent: boolean
  isEmpty: boolean
}

export interface VerifiedWeeklySettlement {
  weekIndex: number
  weekLabel: string
  kWh: number
  wh: number
  wonAmount: number
  ratePerKwh: number
  txHash: string
  timestamp: number
  supplierWallet: string
}

export function getWeekIndex(timestamp: number): number {
  return Math.floor((new Date(timestamp * 1000).getTime() - EPOCH_START.getTime()) / WEEK_MS)
}

export function getWeekStart(weekIndex: number): Date {
  return new Date(EPOCH_START.getTime() + weekIndex * WEEK_MS)
}

export function getWeekEnd(weekIndex: number): Date {
  return new Date(EPOCH_START.getTime() + (weekIndex + 1) * WEEK_MS - 1)
}

function formatWeekLabel(start: Date, end: Date): string {
  return `${start.getMonth() + 1}/${start.getDate()} ~ ${end.getMonth() + 1}/${end.getDate()}`
}

function getCurrentWeekIndex(): number {
  return Math.floor((Date.now() - EPOCH_START.getTime()) / WEEK_MS)
}

function amountsMatch(expected: number, actual: number): boolean {
  if (expected <= 0) return actual <= 0.01
  return Math.abs(expected - actual) <= Math.max(0.01, expected * 0.05)
}

function paymentMatchesWeekEnergy(
  weekKWh: number,
  wonAmount: number,
  extraRates: number[],
): { matched: boolean; rate: number } {
  if (weekKWh <= 0) return { matched: wonAmount <= 0.01, rate: 0 }

  const rates = [...new Set([...PRESET_SETTLEMENT_RATES, ...extraRates.filter((r) => r > 0)])]
  for (const rate of rates) {
    if (amountsMatch(weekKWh * rate, wonAmount)) return { matched: true, rate }
  }

  const implied = wonAmount / weekKWh
  if (implied >= 10 && implied <= 500 && amountsMatch(weekKWh * implied, wonAmount)) {
    return { matched: true, rate: Number(implied.toFixed(2)) }
  }
  return { matched: false, rate: 0 }
}

export function buildWeekRowsFromReadings(readings: EnergyReading[]): WeekRow[] {
  const map: Record<number, { readings: EnergyReading[]; totalWh: number }> = {}

  for (const r of readings) {
    const idx = getWeekIndex(r.timestamp)
    if (!map[idx]) map[idx] = { readings: [], totalWh: 0 }
    map[idx].readings.push(r)
    map[idx].totalWh += r.wh
  }

  const current = getCurrentWeekIndex()

  return Object.entries(map)
    .map(([idxStr, data]) => {
      const weekIndex = Number(idxStr)
      const start = getWeekStart(weekIndex)
      const end = getWeekEnd(weekIndex)
      const totalWh = Number(data.totalWh.toFixed(4))
      return {
        weekIndex,
        weekLabel: formatWeekLabel(start, end),
        start,
        end,
        totalWh,
        totalKWh: totalWh / 1000,
        isCurrent: weekIndex === current,
        isEmpty: data.readings.length === 0,
      }
    })
    .sort((a, b) => a.weekIndex - b.weekIndex)
}

/** 소비자 탭 주차별 정산과 동일한 매칭 — 검증된 주차 정산만 반환 */
export function matchVerifiedWeeklySettlements(
  readings: EnergyReading[],
  transfers: SettlementTransfer[],
  payerWallets: string[],
  extraRates: number[] = [],
): VerifiedWeeklySettlement[] {
  const validPayers = payerWallets.filter((w) => /^0x[a-fA-F0-9]{40}$/.test(w))
  if (!validPayers.length && !transfers.length) return []

  // API가 계량 kWh 기준으로 검증한 송금 포함 — from 지갑과 계량 지갑이 달라도 매칭
  const eligible = transfers

  const weeks = buildWeekRowsFromReadings(readings)
    .filter((w) => !w.isCurrent && w.totalKWh > 0)
    .sort((a, b) => a.weekIndex - b.weekIndex)

  const usedTx = new Set<string>()
  const results: VerifiedWeeklySettlement[] = []

  for (const week of weeks) {
    const weekStartTs = Math.floor(week.start.getTime() / 1000)
    const weekEndTs = Math.floor(week.end.getTime() / 1000)

    let best: SettlementTransfer | null = null
    let bestRate = 0
    let bestScore = Infinity

    for (const t of eligible) {
      if (usedTx.has(t.txHash)) continue
      if (t.timestamp < weekStartTs) continue

      const check = paymentMatchesWeekEnergy(week.totalKWh, t.wonAmount, extraRates)
      if (!check.matched) continue

      const score = Math.abs(t.timestamp - weekEndTs)
      if (score < bestScore) {
        bestScore = score
        best = t
        bestRate = check.rate
      }
    }

    if (best) {
      results.push({
        weekIndex: week.weekIndex,
        weekLabel: week.weekLabel,
        kWh: week.totalKWh,
        wh: week.totalWh,
        wonAmount: best.wonAmount,
        ratePerKwh: bestRate,
        txHash: best.txHash,
        timestamp: best.timestamp,
        supplierWallet: best.to,
      })
      usedTx.add(best.txHash)
    }
  }

  return results.sort((a, b) => b.timestamp - a.timestamp)
}

export function getCalendarWeekDays(anchor: Date): Date[] {
  const d = new Date(anchor)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + mondayOffset)

  return Array.from({ length: 7 }, (_, i) => {
    const dayDate = new Date(monday)
    dayDate.setDate(monday.getDate() + i)
    return dayDate
  })
}

export function formatDayLabel(d: Date): string {
  return d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' })
}
