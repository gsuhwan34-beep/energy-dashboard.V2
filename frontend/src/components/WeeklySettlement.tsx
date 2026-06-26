import { useState, useMemo } from 'react'
import type { EnergyReading, SettlementTransfer } from '../hooks/useEnergyData'
import type { EnergySupplier } from '../hooks/useWallet'
import { PRESET_SETTLEMENT_RATES } from '../hooks/useWallet'
import {
  Calendar, Coins, CheckCircle2, Loader2,
  AlertCircle, ChevronLeft, ChevronRight, Clock,
} from 'lucide-react'

interface WeekRow {
  weekIndex: number
  weekLabel: string
  start: Date
  end: Date
  readings: EnergyReading[]
  totalWh: number
  totalKWh: number
  wonAmount: number
  isCurrent: boolean
  isEmpty: boolean
}

interface Props {
  readings: EnergyReading[]
  settlements: SettlementTransfer[]
  isWalletConnected: boolean
  supplier: EnergySupplier
  payerWallets?: string[]
  onTransfer: (amountKwh: number, supplierWallet: string, rate: number) => Promise<string>
  onSettlementDone: () => void
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const EPOCH_START = new Date('2026-05-04T00:00:00+09:00')

function getWeekIndex(timestamp: number): number {
  const date = new Date(timestamp * 1000)
  return Math.floor((date.getTime() - EPOCH_START.getTime()) / WEEK_MS)
}

function getWeekStart(weekIndex: number): Date {
  return new Date(EPOCH_START.getTime() + weekIndex * WEEK_MS)
}

function getWeekEnd(weekIndex: number): Date {
  return new Date(EPOCH_START.getTime() + (weekIndex + 1) * WEEK_MS - 1)
}

function formatDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function getMonthWeekRange(year: number, month: number): { first: number; last: number } {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999)

  let firstMonday = new Date(monthStart)
  while (firstMonday.getDay() !== 1) firstMonday.setDate(firstMonday.getDate() + 1)

  let lastMonday = new Date(monthEnd)
  while (lastMonday.getDay() !== 1) lastMonday.setDate(lastMonday.getDate() - 1)

  const firstIdx = Math.floor((firstMonday.getTime() - EPOCH_START.getTime()) / WEEK_MS)
  const lastIdx = Math.floor((lastMonday.getTime() - EPOCH_START.getTime()) / WEEK_MS)
  return { first: firstIdx, last: lastIdx }
}

function getCurrentWeekIndex(): number {
  return Math.floor((Date.now() - EPOCH_START.getTime()) / WEEK_MS)
}

function getAvailableMonths(readings: EnergyReading[]): { year: number; month: number; label: string }[] {
  const monthSet = new Set<string>()
  const now = new Date()
  monthSet.add(`${now.getFullYear()}-${now.getMonth()}`)
  for (const r of readings) {
    const d = new Date(r.timestamp * 1000)
    monthSet.add(`${d.getFullYear()}-${d.getMonth()}`)
  }
  return Array.from(monthSet)
    .map(key => { const [y, m] = key.split('-').map(Number); return { year: y, month: m, label: `${y}년 ${m + 1}월` } })
    .sort((a, b) => a.year - b.year || a.month - b.month)
}

/**
 * 온체인 WON 전송 기록을 주차별로 매칭.
 * 공급자 탭과 무관 — 구매자 지갑 + kWh 기반 금액으로 판별.
 */
function amountsMatch(expected: number, actual: number): boolean {
  if (expected <= 0) return actual <= 0.01
  const diff = Math.abs(expected - actual)
  return diff <= Math.max(0.01, expected * 0.05)
}

function paymentMatchesWeekEnergy(
  week: WeekRow,
  transfer: SettlementTransfer,
  extraRates: number[],
): boolean {
  if (week.isEmpty && week.totalKWh <= 0) return transfer.wonAmount <= 0.01
  if (week.totalKWh <= 0) return false

  const rates = [...new Set([...PRESET_SETTLEMENT_RATES, ...extraRates.filter(r => r > 0)])]
  for (const rate of rates) {
    if (amountsMatch(week.totalKWh * rate, transfer.wonAmount)) return true
  }

  const impliedRate = transfer.wonAmount / week.totalKWh
  if (impliedRate >= 10 && impliedRate <= 500) {
    return amountsMatch(week.totalKWh * impliedRate, transfer.wonAmount)
  }
  return false
}

function matchSettlementsToWeeks(
  weeks: WeekRow[],
  settlements: SettlementTransfer[],
  payerWallets: string[],
  extraRates: number[],
): Record<number, { txHash: string; wonAmount: number; to: string }> {
  const matched: Record<number, { txHash: string; wonAmount: number; to: string }> = {}
  if (!settlements.length || !payerWallets.length) return matched

  const payerSet = new Set(payerWallets.map(w => w.toLowerCase()))
  const eligible = settlements.filter(s => payerSet.has(s.from.toLowerCase()))

  const weeksSorted = [...weeks]
    .filter(w => !w.isCurrent)
    .sort((a, b) => a.weekIndex - b.weekIndex)

  const usedTx = new Set<string>()

  for (const week of weeksSorted) {
    if (week.wonAmount <= 0 && week.isEmpty) continue

    const weekStartTs = Math.floor(week.start.getTime() / 1000)
    const weekEndTs = Math.floor(week.end.getTime() / 1000)

    let bestMatch: SettlementTransfer | null = null
    let bestScore = Infinity

    for (const s of eligible) {
      if (usedTx.has(s.txHash)) continue
      if (s.timestamp < weekStartTs) continue
      if (!paymentMatchesWeekEnergy(week, s, extraRates)) continue

      const score = Math.abs(s.timestamp - weekEndTs)
      if (score < bestScore) {
        bestScore = score
        bestMatch = s
      }
    }

    if (bestMatch) {
      matched[week.weekIndex] = {
        txHash: bestMatch.txHash,
        wonAmount: bestMatch.wonAmount,
        to: bestMatch.to,
      }
      usedTx.add(bestMatch.txHash)
    }
  }

  return matched
}

export default function WeeklySettlement({
  readings, settlements, isWalletConnected, supplier, payerWallets = [], onTransfer, onSettlementDone,
}: Props) {
  const [justSettled, setJustSettled] = useState<Record<number, string>>({})
  const [settling, setSettling] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const availableMonths = useMemo(() => getAvailableMonths(readings), [readings])
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(availableMonths.length - 1)
  const selectedMonth = availableMonths[Math.max(0, Math.min(selectedMonthIdx, availableMonths.length - 1))]

  const currentWeekIndex = useMemo(() => getCurrentWeekIndex(), [])

  const readingsByWeek = useMemo(() => {
    const map: Record<number, EnergyReading[]> = {}
    for (const r of readings) {
      const idx = getWeekIndex(r.timestamp)
      if (!map[idx]) map[idx] = []
      map[idx].push(r)
    }
    return map
  }, [readings])

  const weeks: WeekRow[] = useMemo(() => {
    if (!selectedMonth) return []
    const { first, last } = getMonthWeekRange(selectedMonth.year, selectedMonth.month)
    const rows: WeekRow[] = []

    for (let idx = first; idx <= last; idx++) {
      const start = getWeekStart(idx)
      const end = getWeekEnd(idx)
      const weekReadings = readingsByWeek[idx] ?? []
      const totalWh = weekReadings.reduce((sum, r) => sum + r.wh, 0)
      const totalKWh = totalWh / 1000
      const wonAmount = totalKWh * supplier.rate

      rows.push({
        weekIndex: idx,
        weekLabel: `${formatDate(start)} ~ ${formatDate(end)}`,
        start, end,
        readings: weekReadings,
        totalWh, totalKWh, wonAmount,
        isCurrent: idx === currentWeekIndex,
        isEmpty: weekReadings.length === 0,
      })
    }
    return rows.sort((a, b) => b.weekIndex - a.weekIndex)
  }, [selectedMonth, readingsByWeek, currentWeekIndex, supplier.rate])

  const onchainSettled = useMemo(
    () => matchSettlementsToWeeks(weeks, settlements, payerWallets, [supplier.rate]),
    [weeks, settlements, payerWallets, supplier.rate],
  )

  async function handleSettle(week: WeekRow) {
    if (!isWalletConnected || settling !== null) return
    setSettling(week.weekIndex)
    setError(null)
    try {
      const txHash = await onTransfer(week.totalKWh, supplier.wallet, supplier.rate)
      setJustSettled(prev => ({ ...prev, [week.weekIndex]: txHash }))
      onSettlementDone()
    } catch (err: any) {
      setError(err.message || '정산에 실패했습니다.')
    } finally {
      setSettling(null)
    }
  }

  function goMonth(dir: -1 | 1) {
    setSelectedMonthIdx(prev => {
      const next = prev + dir
      if (next < 0 || next >= availableMonths.length) return prev
      return next
    })
  }

  return (
    <div className="border border-border-strong rounded-lg bg-bg-base-opaque overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-base">
        <Coins className="w-4 h-4 text-brand-100" />
        <h3 className="text-sm font-semibold text-fg-base">주간 정산</h3>
        <span className="ml-auto text-[10px] text-fg-muted">
          {supplier.emoji} {supplier.label} · {supplier.rate} WON/kWh · 온체인 검증
        </span>
      </div>

      {/* 월 선택 */}
      <div className="flex items-center justify-center gap-3 px-4 py-2.5 border-b border-border-base bg-bg-subtle/50">
        <button onClick={() => goMonth(-1)} disabled={selectedMonthIdx <= 0}
          className="p-1 rounded hover:bg-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4 text-fg-subtle" />
        </button>
        <span className="text-sm font-semibold text-fg-base min-w-[100px] text-center">
          {selectedMonth?.label ?? ''}
        </span>
        <button onClick={() => goMonth(1)} disabled={selectedMonthIdx >= availableMonths.length - 1}
          className="p-1 rounded hover:bg-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-4 h-4 text-fg-subtle" />
        </button>
      </div>

      {error && (
        <div className="mx-4 mt-3 p-2.5 rounded-lg border border-tag-orange-100/30 bg-tag-orange-10 flex items-center gap-2 text-xs text-tag-orange-100">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
        </div>
      )}

      {!isWalletConnected && (
        <div className="mx-4 mt-3 p-2.5 rounded-lg border border-tag-blue-100/30 bg-tag-blue-10 flex items-center gap-2 text-xs text-tag-blue-100">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          정산을 위해 먼저 MetaMask 지갑을 연결해 주세요.
        </div>
      )}

      {/* 주차별 목록 */}
      <div className="divide-y divide-border-base">
        {weeks.map((week) => {
          const chainMatch = onchainSettled[week.weekIndex]
          const justMatch = justSettled[week.weekIndex]
          const settledTxHash = chainMatch?.txHash || justMatch || null
          const isSettled = !!settledTxHash || (week.isEmpty && !week.isCurrent)
          const isSettling = settling === week.weekIndex

          return (
            <div key={week.weekIndex}
              className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 ${week.isCurrent ? 'bg-brand-10/30' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-fg-muted shrink-0" />
                  <span className="text-sm font-medium text-fg-base">{week.weekLabel}</span>
                  {week.isCurrent && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-100 text-white">현재</span>}
                  <span className="text-[10px] text-fg-muted">({week.readings.length}건)</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-fg-subtle">
                  <span>{week.totalWh.toLocaleString()} Wh ({week.totalKWh.toFixed(4)} kWh)</span>
                  <span className="font-semibold text-fg-base">{week.wonAmount.toFixed(2)} WON</span>
                </div>
              </div>

              <div className="shrink-0">
                {week.isCurrent ? (
                  <button disabled className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-bg-subtle text-fg-muted cursor-not-allowed">
                    <Clock className="w-3.5 h-3.5" />계량 중...
                  </button>
                ) : isSettled ? (
                  <div className="flex items-center gap-1.5">
                    <button disabled className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-bg-subtle text-fg-disabled cursor-not-allowed">
                      <CheckCircle2 className="w-3.5 h-3.5" />정산됨
                    </button>
                    {settledTxHash && (
                      <a href={`https://sepolia.arbiscan.io/tx/${settledTxHash}`} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-brand-100 hover:underline">Tx</a>
                    )}
                  </div>
                ) : (
                  <button onClick={() => handleSettle(week)}
                    disabled={!isWalletConnected || isSettling}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                      !isWalletConnected ? 'bg-bg-subtle text-fg-disabled cursor-not-allowed'
                      : isSettling ? 'bg-brand-30 text-white cursor-wait'
                      : 'bg-brand-100 text-white hover:opacity-90'
                    }`}>
                    {isSettling ? (<><Loader2 className="w-3.5 h-3.5 animate-spin" />정산 중...</>)
                     : (<><Coins className="w-3.5 h-3.5" />정산하기</>)}
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {weeks.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-fg-muted">해당 월에 주차 데이터가 없습니다.</div>
        )}
      </div>
    </div>
  )
}
