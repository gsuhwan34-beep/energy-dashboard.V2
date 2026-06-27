import { useState, useEffect, useMemo } from 'react'
import { useEnergyData, useConsumerSettlements } from '../hooks/useEnergyData'
import { useProducerData } from '../hooks/useProducerData'
import type { useWallet } from '../hooks/useWallet'
import WeeklyHeatmap from '../components/presentation/WeeklyHeatmap'
import MeterTxTable from '../components/presentation/MeterTxTable'
import SettlementTxTable from '../components/presentation/SettlementTxTable'
import SalesTxTable from '../components/presentation/SalesTxTable'
import {
  DEMO_CONSUMER_WALLET,
  STORAGE_CONSUMER_WALLET,
  STORAGE_PRODUCER_WALLET,
  readStoredWallet,
  readStoredSupplierRate,
  resolvePayerWallets,
  toDateInputValue,
  shortAddr,
  getCalendarWeekDays,
  formatDayLabel,
} from '../lib/presentation'
import { matchVerifiedWeeklySettlements } from '../lib/settlementMatch'
import { Calendar } from 'lucide-react'

type WalletHook = ReturnType<typeof useWallet>
type SubTab = 'heatmap' | 'consumer' | 'supplier'

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'heatmap', label: '히트맵' },
  { id: 'consumer', label: '소비자 기록' },
  { id: 'supplier', label: '공급자 기록' },
]

interface Props {
  wallet: WalletHook
}

export default function PresentationDashboard({ wallet }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('heatmap')
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()))
  const [consumerWallet, setConsumerWallet] = useState(DEMO_CONSUMER_WALLET)
  const [producerWallet, setProducerWallet] = useState('')
  const [extraRates, setExtraRates] = useState<number[]>([])

  useEffect(() => {
    const sync = () => {
      setConsumerWallet(readStoredWallet(STORAGE_CONSUMER_WALLET, DEMO_CONSUMER_WALLET))
      const stored = readStoredWallet(STORAGE_PRODUCER_WALLET, '')
      setProducerWallet(wallet.address || stored)
      setExtraRates(readStoredSupplierRate())
    }
    sync()
    window.addEventListener('focus', sync)
    const id = setInterval(sync, 3000)
    return () => {
      window.removeEventListener('focus', sync)
      clearInterval(id)
    }
  }, [wallet.address])

  const payerWallets = useMemo(
    () => resolvePayerWallets(consumerWallet, wallet.address),
    [consumerWallet, wallet.address],
  )

  const dateObj = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number)
    return new Date(y, m - 1, d)
  }, [selectedDate])

  const weekDays = useMemo(() => getCalendarWeekDays(dateObj), [dateObj])
  const weekRangeLabel = useMemo(
    () => `${formatDayLabel(weekDays[0])} ~ ${formatDayLabel(weekDays[6])}`,
    [weekDays],
  )

  const { data: consumerData } = useEnergyData(consumerWallet)
  const { data: producerData } = useProducerData(producerWallet)
  const { data: settlementData } = useConsumerSettlements(
    /^0x[a-fA-F0-9]{40}$/.test(consumerWallet) ? [consumerWallet] : payerWallets,
  )

  const consumerReadings = consumerData?.readings ?? []
  const producerReadings = producerData?.productions ?? []
  const sales = producerData?.sales ?? []

  const verifiedSettlements = useMemo(
    () =>
      matchVerifiedWeeklySettlements(
        consumerReadings,
        settlementData?.transfers ?? [],
        payerWallets,
        extraRates,
      ),
    [consumerReadings, settlementData?.transfers, payerWallets, extraRates],
  )

  const overview = producerData?.overview

  return (
    <div className="presentation-mode -mx-4 md:-mx-0">
      <div className="bg-slate-950 rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base md:text-lg font-bold text-white tracking-tight">
            소비자/공급자 블록체인 기록
          </h2>
          <div className="flex p-0.5 rounded-lg bg-white/5 border border-white/10">
            {SUB_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`px-3 md:px-5 py-2 rounded-md text-xs md:text-sm font-bold transition-all ${
                  subTab === t.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-5 h-[calc(100vh-11rem)] md:h-[calc(100vh-10rem)] flex flex-col min-h-0">
          {subTab === 'heatmap' && (
            <div className="flex flex-col h-full min-h-0 gap-3">
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <Calendar className="w-4 h-4 text-white/50" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-sm text-white font-medium outline-none [color-scheme:dark]"
                  />
                </label>
                <span className="text-xs text-white/60 font-medium">{weekRangeLabel} (7일)</span>
                <span className="text-[10px] text-white/40">
                  소비 {shortAddr(consumerWallet)} · 공급 {producerWallet ? shortAddr(producerWallet) : '지갑 미연결'}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
                <WeeklyHeatmap
                  title="소비 계량기 (주간)"
                  subtitle={consumerWallet}
                  readings={consumerReadings}
                  anchorDate={dateObj}
                />
                <WeeklyHeatmap
                  title="공급 계량기 (주간)"
                  subtitle={producerWallet || 'MetaMask 연결 필요'}
                  readings={producerReadings}
                  anchorDate={dateObj}
                />
              </div>
            </div>
          )}

          {subTab === 'consumer' && (
            <div className="flex flex-col h-full min-h-0 gap-2">
              <p className="text-[10px] text-white/45 shrink-0">
                계량 {shortAddr(consumerWallet)}
                {payerWallets.length > 1 && (
                  <> · 정산 지갑 {payerWallets.map(shortAddr).join(', ')}</>
                )}
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
                <MeterTxTable
                  title="온체인 계량 기록"
                  readings={consumerReadings}
                  emptyText="소비자 탭에서 계량기를 조회해 주세요"
                />
                <SettlementTxTable
                  title="주차별 P2P 정산 내역"
                  rows={verifiedSettlements}
                  emptyText="검증된 주차별 정산이 없습니다. 소비자 탭에서 주차 정산을 완료해 주세요."
                />
              </div>
            </div>
          )}

          {subTab === 'supplier' && (
            <div className="flex flex-col h-full min-h-0 gap-3">
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-center">
                  <p className="text-[10px] text-white/50 mb-0.5">판매량</p>
                  <p className="text-xl md:text-2xl font-black text-violet-200">
                    {(overview?.soldKWh ?? 0).toFixed(3)}
                    <span className="text-sm font-normal text-white/50 ml-1">kWh</span>
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center">
                  <p className="text-[10px] text-white/50 mb-0.5">판매 재고</p>
                  <p className="text-xl md:text-2xl font-black text-emerald-200">
                    {(overview?.availableKWh ?? 0).toFixed(3)}
                    <span className="text-sm font-normal text-white/50 ml-1">kWh</span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
                <MeterTxTable
                  title="온체인 계량 기록"
                  readings={producerReadings}
                  emptyText="생산자 탭에서 조회하거나 MetaMask를 연결해 주세요"
                />
                <SalesTxTable title="주차별 P2P 판매 내역" sales={sales} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
