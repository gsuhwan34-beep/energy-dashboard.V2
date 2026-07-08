import type { EnergyReading, SettlementTransfer } from '../hooks/useEnergyData'
import { PRESET_SETTLEMENT_RATES } from '../hooks/useWallet'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
export const SETTLEMENT_EPOCH_START = new Date('2026-05-04T00:00:00+09:00')
const EPOCH_START = SETTLEMENT_EPOCH_START

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
  buyerWallet?: string
  meterWallet?: string | null
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

/** EPOCH(2026-05)부터 현재 월까지 — 계량 유무와 무관하게 모든 달 포함 */
export function getSettlementEpochMonths(): { year: number; month: number; label: string }[] {
  const startYear = EPOCH_START.getFullYear()
  const startMonth = EPOCH_START.getMonth()
  const now = new Date()
  const endYear = now.getFullYear()
  const endMonth = now.getMonth()

  const months: { year: number; month: number; label: string }[] = []
  let year = startYear
  let month = startMonth

  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push({ year, month, label: `${year}년 ${month + 1}월` })
    month += 1
    if (month > 11) {
      month = 0
      year += 1
    }
  }

  return months
}

/** 해당 달과 겹치는 EPOCH 주차 범위 (월 경계 주차 누락 방지) */
export function getSettlementMonthWeekRange(year: number, month: number): { first: number; last: number } {
  const monthStart = new Date(year, month, 1, 0, 0, 0, 0)
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999)
  const epochMs = EPOCH_START.getTime()
  const currentWeekIdx = getCurrentWeekIndex()

  if (monthEnd.getTime() < epochMs) {
    return { first: 0, last: -1 }
  }

  const rangeStart = Math.max(monthStart.getTime(), epochMs)
  let first = Math.floor((rangeStart - epochMs) / WEEK_MS)
  let last = Math.floor((monthEnd.getTime() - epochMs) / WEEK_MS)
  last = Math.min(last, currentWeekIdx)

  if (first > last) {
    return { first: 0, last: -1 }
  }

  return { first, last }
}

export function getCurrentSettlementWeekIndex(): number {
  return getCurrentWeekIndex()
}

export function buildEpochWeekRows(
  firstIdx: number,
  lastIdx: number,
  readings: EnergyReading[],
): WeekRow[] {
  if (lastIdx < firstIdx) return []

  const readingsByWeek: Record<number, EnergyReading[]> = {}
  for (const r of readings) {
    const idx = getWeekIndex(r.timestamp)
    if (!readingsByWeek[idx]) readingsByWeek[idx] = []
    readingsByWeek[idx].push(r)
  }

  const current = getCurrentWeekIndex()
  const rows: WeekRow[] = []

  for (let weekIndex = firstIdx; weekIndex <= lastIdx; weekIndex += 1) {
    const start = getWeekStart(weekIndex)
    const end = getWeekEnd(weekIndex)
    const weekReadings = readingsByWeek[weekIndex] ?? []
    const totalWh = weekReadings.reduce((sum, r) => sum + r.wh, 0)

    rows.push({
      weekIndex,
      weekLabel: formatWeekLabel(start, end),
      start,
      end,
      totalWh: Number(totalWh.toFixed(4)),
      totalKWh: totalWh / 1000,
      isCurrent: weekIndex === current,
      isEmpty: weekReadings.length === 0,
    })
  }

  return rows
}

function amountsMatch(expected: number, actual: number): boolean {
  if (expected <= 0) return actual <= 0.01
  return Math.abs(expected - actual) <= Math.max(0.05, expected * 0.08)
}

function whAmountsMatch(expectedWh: number, actualWh: number): boolean {
  if (expectedWh <= 0) return actualWh <= 1
  return Math.abs(expectedWh - actualWh) <= Math.max(1, expectedWh * 0.08)
}

/** 정산 트랜잭션을 주차 종료 후에도 인정 (다음 달에 정산하는 경우 포함) */
const SETTLEMENT_GRACE_SEC = 90 * 24 * 60 * 60

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

export interface WeekSettlementMatch {
  txHash: string
  wonAmount: number
  to: string
  soldWh?: number
}

function ledgerPurchaseMatchesWeek(
  week: Pick<WeekRow, 'totalWh' | 'totalKWh'>,
  purchase: SettlementTransfer,
): boolean {
  if (week.totalWh <= 0) return false
  if (purchase.soldWh == null || purchase.soldWh <= 0) return false
  return whAmountsMatch(week.totalWh, purchase.soldWh)
}

function ledgerWhMatchScore(weekWh: number, soldWh: number): number {
  if (weekWh <= 0 || soldWh <= 0) return Infinity
  return Math.abs(weekWh - soldWh) / Math.max(weekWh, 1)
}

/**
 * 주간 정산 UI — P2P 원장 EnergySold만 인정.
 * 공급자 탭과 무관하게 soldWh ↔ 주차 계량 Wh가 맞으면 정산됨.
 * (배포 전 WON 직접 송금은 원장에 없으므로 정산하기로 표시)
 */
export function matchLedgerPurchasesToWeekRows(
  weeks: WeekRow[],
  purchases: SettlementTransfer[],
): Record<number, WeekSettlementMatch> {
  const matched: Record<number, WeekSettlementMatch> = {}
  const eligible = purchases.filter((p) => p.soldWh != null && p.soldWh > 0)
  if (!eligible.length) return matched

  const weekList = weeks
    .filter((w) => !w.isCurrent && w.totalWh > 0)
    .sort((a, b) => a.weekIndex - b.weekIndex)

  const pairs: { week: WeekRow; p: SettlementTransfer; score: number }[] = []

  for (const week of weekList) {
    const weekEndTs = Math.floor(week.end.getTime() / 1000)
    for (const p of eligible) {
      if (!ledgerPurchaseMatchesWeek(week, p)) continue
      const whScore = ledgerWhMatchScore(week.totalWh, p.soldWh!)
      const timeScore = Math.abs(p.timestamp - weekEndTs) / SETTLEMENT_GRACE_SEC
      pairs.push({ week, p, score: whScore * 100 + timeScore })
    }
  }

  pairs.sort((a, b) => a.score - b.score)

  const usedTx = new Set<string>()
  const usedWeek = new Set<number>()

  for (const { week, p } of pairs) {
    if (usedTx.has(p.txHash) || usedWeek.has(week.weekIndex)) continue
    matched[week.weekIndex] = {
      txHash: p.txHash,
      wonAmount: p.wonAmount,
      to: p.to,
      soldWh: p.soldWh,
    }
    usedTx.add(p.txHash)
    usedWeek.add(week.weekIndex)
  }

  return matched
}

function amountMatchScore(weekKWh: number, wonAmount: number, extraRates: number[]): number {
  if (weekKWh <= 0) return wonAmount <= 0.01 ? 0 : Infinity
  const rates = [...new Set([...PRESET_SETTLEMENT_RATES, ...extraRates.filter((r) => r > 0)])]
  let best = Infinity
  for (const rate of rates) {
    const expected = weekKWh * rate
    const diff = Math.abs(expected - wonAmount)
    if (diff <= Math.max(0.05, expected * 0.08)) {
      best = Math.min(best, diff / Math.max(expected, 1))
    }
  }
  const implied = wonAmount / weekKWh
  if (implied >= 10 && implied <= 500) {
    const diff = Math.abs(weekKWh * implied - wonAmount)
    if (diff <= Math.max(0.05, wonAmount * 0.08)) {
      best = Math.min(best, diff / Math.max(wonAmount, 1))
    }
  }
  return best
}

function transferMatchesWeek(
  week: Pick<WeekRow, 'totalWh' | 'totalKWh'>,
  transfer: SettlementTransfer,
  extraRates: number[],
): boolean {
  if (week.totalKWh <= 0 && week.totalWh <= 0) return false

  if (transfer.soldWh != null && transfer.soldWh > 0 && week.totalWh > 0) {
    if (whAmountsMatch(week.totalWh, transfer.soldWh)) return true
  }

  if (week.totalKWh > 0) {
    return amountMatchScore(week.totalKWh, transfer.wonAmount, extraRates) !== Infinity
  }

  return false
}

/** @deprecated WON 송금 매칭 — 주간 UI는 matchLedgerPurchasesToWeekRows 사용 */
export function matchSettlementsToWeekRows(
  weeks: WeekRow[],
  transfers: SettlementTransfer[],
  supplierWallet: string,
  extraRates: number[] = [],
): Record<number, WeekSettlementMatch> {
  const matched: Record<number, WeekSettlementMatch> = {}
  if (!transfers.length || !/^0x[a-fA-F0-9]{40}$/i.test(supplierWallet)) return matched

  const supplierLower = supplierWallet.toLowerCase()
  const eligible = transfers.filter((t) => t.to.toLowerCase() === supplierLower)
  const rates = [...new Set([...PRESET_SETTLEMENT_RATES, ...extraRates.filter((r) => r > 0)])]

  const weekList = weeks
    .filter((w) => !w.isCurrent && w.totalKWh > 0)
    .sort((a, b) => a.weekIndex - b.weekIndex)

  const pairs: { week: WeekRow; t: SettlementTransfer; score: number }[] = []

  for (const week of weekList) {
    const weekStartTs = Math.floor(week.start.getTime() / 1000)
    const weekEndTs = Math.floor(week.end.getTime() / 1000)

    for (const t of eligible) {
      if (t.timestamp < weekStartTs) continue
      if (!transferMatchesWeek(week, t, rates)) continue

      const amountScore = amountMatchScore(week.totalKWh, t.wonAmount, rates)
      const whScore =
        t.soldWh != null && t.soldWh > 0 && week.totalWh > 0
          ? Math.abs(week.totalWh - t.soldWh) / Math.max(week.totalWh, 1)
          : amountScore

      const timeScore = Math.abs(t.timestamp - weekEndTs) / SETTLEMENT_GRACE_SEC
      pairs.push({ week, t, score: whScore * 10 + timeScore })
    }
  }

  pairs.sort((a, b) => a.score - b.score)

  const usedTx = new Set<string>()
  const usedWeek = new Set<number>()

  for (const { week, t } of pairs) {
    if (usedTx.has(t.txHash) || usedWeek.has(week.weekIndex)) continue
    matched[week.weekIndex] = {
      txHash: t.txHash,
      wonAmount: t.wonAmount,
      to: t.to,
    }
    usedTx.add(t.txHash)
    usedWeek.add(week.weekIndex)
  }

  return matched
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

/** 프레젠테이션 등 — 원장 EnergySold 기준 검증된 주차 정산 */
export function matchVerifiedWeeklySettlements(
  readings: EnergyReading[],
  transfers: SettlementTransfer[],
  _payerWallets: string[],
  _extraRates: number[] = [],
): VerifiedWeeklySettlement[] {
  const weeks = buildWeekRowsFromReadings(readings)
  const matched = matchLedgerPurchasesToWeekRows(weeks, transfers)

  return Object.entries(matched)
    .map(([idxStr, m]) => {
      const weekIndex = Number(idxStr)
      const week = weeks.find((w) => w.weekIndex === weekIndex)
      if (!week) return null
      const purchase = transfers.find((t) => t.txHash === m.txHash)
      const rate = week.totalKWh > 0 ? m.wonAmount / week.totalKWh : 0
      return {
        weekIndex,
        weekLabel: week.weekLabel,
        kWh: week.totalKWh,
        wh: week.totalWh,
        wonAmount: m.wonAmount,
        ratePerKwh: Number(rate.toFixed(2)),
        txHash: m.txHash,
        timestamp: purchase?.timestamp ?? 0,
        supplierWallet: m.to,
        buyerWallet: purchase?.buyerWallet ?? purchase?.from,
        meterWallet: purchase?.meterWallet ?? null,
      }
    })
    .filter((r): r is VerifiedWeeklySettlement => r != null)
    .sort((a, b) => b.timestamp - a.timestamp)
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
