import { useState, useMemo, useEffect } from 'react'
import type { EnergyReading, SettlementTransfer } from '../hooks/useEnergyData'
import type { EnergySupplier } from '../hooks/useWallet'
import {
  getSettlementEpochMonths,
  getSettlementMonthWeekRange,
  buildEpochWeekRows,
  getWeekIndex,
  matchSettlementsToWeekRows,
} from '../lib/settlementMatch'
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
  consumerWallet?: string
  onTransfer: (amountKwh: number, supplierWallet: string, rate: number) => Promise<string>
  onSettlementDone: () => void
}

export default function WeeklySettlement({
  readings, settlements, isWalletConnected, supplier, onTransfer, onSettlementDone,
}: Props) {
  const [justSettled, setJustSettled] = useState<Record<number, string>>({})
  const [settling, setSettling] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const availableMonths = useMemo(() => getSettlementEpochMonths(), [])
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(() => Math.max(0, getSettlementEpochMonths().length - 1))

  useEffect(() => {
    setSelectedMonthIdx((prev) => Math.min(prev, Math.max(0, availableMonths.length - 1)))
  }, [availableMonths.length])

  const selectedMonth = availableMonths[Math.max(0, Math.min(selectedMonthIdx, availableMonths.length - 1))]

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
    const { first, last } = getSettlementMonthWeekRange(selectedMonth.year, selectedMonth.month)

    return buildEpochWeekRows(first, last, readings)
      .map((row) => ({
        ...row,
        readings: readingsByWeek[row.weekIndex] ?? [],
        wonAmount: row.totalKWh * supplier.rate,
      }))
      .sort((a, b) => b.weekIndex - a.weekIndex)
  }, [selectedMonth, readings, readingsByWeek, supplier.rate])

  const onchainSettled = useMemo(
    () => matchSettlementsToWeekRows(
      weeks.map(({ weekIndex, weekLabel, start, end, totalWh, totalKWh, isCurrent, isEmpty }) => ({
        weekIndex,
        weekLabel,
        start,
        end,
        totalWh,
        totalKWh,
        isCurrent,
        isEmpty,
      })),
      settlements,
      supplier.wallet,
      [supplier.rate],
    ),
    [weeks, settlements, supplier.wallet, supplier.rate],
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
          정산을 위해 먼저 지갑을 연결해 주세요.
        </div>
      )}

      {/* 주차별 목록 */}
      <div className="divide-y divide-border-base">
        {weeks.map((week) => {
          const chainMatch = onchainSettled[week.weekIndex]
          const justMatch = justSettled[week.weekIndex]
          const settledTxHash = chainMatch?.txHash || justMatch || null
          const isSettled = !!settledTxHash
          const isSettling = settling === week.weekIndex
          const canSettle = week.totalKWh > 0

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
                ) : !canSettle ? (
                  <button disabled className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-bg-subtle text-fg-muted cursor-not-allowed">
                    <Clock className="w-3.5 h-3.5" />계량 없음
                  </button>
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
