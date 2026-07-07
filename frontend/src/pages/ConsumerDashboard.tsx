import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useEnergyData, useNetworkStatus, useConsumerSettlements } from '../hooks/useEnergyData'
import { SUPPLIERS } from '../hooks/useWallet'
import type { EnergySupplier } from '../hooks/useWallet'
import type { useWallet } from '../hooks/useWallet'
import StatCard from '../components/StatCard'
import DeviceStatus from '../components/DeviceStatus'
import LiveReading from '../components/LiveReading'
import EnergyChart from '../components/EnergyChart'
import DashboardHeatmap from '../components/DashboardHeatmap'
import TransactionTable from '../components/TransactionTable'
import WeeklySettlement from '../components/WeeklySettlement'
import { Zap, Search, AlertCircle } from 'lucide-react'
import { api } from '../lib/api'
import { writeStoredWallet, STORAGE_CONSUMER_WALLET, STORAGE_SUPPLIER_RATE, STORAGE_PAYER_WALLET, resolvePayerWallets } from '../lib/presentation'
import { toDeltaReadings, getCumulativeWh, getLatestDeltaReading } from '../lib/readingDelta'

const DEFAULT_WALLET = '0x6220F267AEDfB782d8aDD9D13AAB3f5B51c0b3c5'

type WalletHook = ReturnType<typeof useWallet>

interface Props {
  wallet: WalletHook
}

export default function ConsumerDashboard({ wallet }: Props) {
  const [walletInput, setWalletInput] = useState(DEFAULT_WALLET)
  const [activeWallet, setActiveWallet] = useState(DEFAULT_WALLET)
  const [weekAnchor, setWeekAnchor] = useState(() => new Date())

  useEffect(() => {
    writeStoredWallet(STORAGE_CONSUMER_WALLET, activeWallet)
  }, [activeWallet])

  const [supplierId, setSupplierId] = useState<'renewable' | 'mixed'>('renewable')
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [customSupplierWallet, setCustomSupplierWallet] = useState('')
  const [customSupplierRate, setCustomSupplierRate] = useState<number | ''>(150)
  const [isFetchingPrice, setIsFetchingPrice] = useState(false)
  const lastFetchedWalletRef = useRef<string | null>(null)

  const supplier: EnergySupplier = isCustomMode
    ? {
        id: 'custom',
        label: '신규 무허가 공급자 (P2P)',
        emoji: '🤝',
        rate: Number(customSupplierRate) || 0,
        wallet: customSupplierWallet || '0x0000000000000000000000000000000000000000',
        description: '생산자 탭에서 설정한 단가로 정산됩니다',
      }
    : SUPPLIERS[supplierId]

  useEffect(() => {
    if (supplier.rate > 0) {
      try {
        localStorage.setItem(STORAGE_SUPPLIER_RATE, String(supplier.rate))
      } catch {
        // ignore
      }
    }
  }, [supplier.rate])

  const { data, loading, error, refetch } = useEnergyData(activeWallet)
  const { network } = useNetworkStatus()

  const payerWallets = useMemo(
    () => resolvePayerWallets(activeWallet, wallet.address),
    [activeWallet, wallet.address],
  )

  // settlements는 useConsumerSettlements(계량 지갑) API 결과 — payerWallets는 조회용
  const { data: settlementData, refetch: refetchSettlements } = useConsumerSettlements(
    /^0x[a-fA-F0-9]{40}$/.test(activeWallet) ? [activeWallet] : payerWallets,
  )

  const fetchSupplierPrice = useCallback(async (walletAddress: string) => {
    const normalized = walletAddress.toLowerCase()
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) return
    if (lastFetchedWalletRef.current === normalized) return

    setIsFetchingPrice(true)
    try {
      const res = await fetch(api(`supplier/price/${walletAddress}`))
      if (!res.ok) throw new Error('price fetch failed')
      const resData = await res.json()
      lastFetchedWalletRef.current = normalized
      setCustomSupplierRate(Number(resData.price))
    } catch (err) {
      console.error('단가 조회 실패:', err)
    } finally {
      setIsFetchingPrice(false)
    }
  }, [])

  useEffect(() => {
    if (!isCustomMode) return
    const trimmed = customSupplierWallet.trim()
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      lastFetchedWalletRef.current = null
      return
    }
    if (lastFetchedWalletRef.current !== trimmed.toLowerCase()) {
      fetchSupplierPrice(trimmed)
    }
  }, [customSupplierWallet, isCustomMode, fetchSupplierPrice])

  const handleSupplierWalletChange = (value: string) => {
    const next = value.trim()
    if (next.toLowerCase() !== (lastFetchedWalletRef.current ?? '')) {
      lastFetchedWalletRef.current = null
    }
    setCustomSupplierWallet(value)
  }

  const overview = data?.overview ?? null
  const readings = data?.readings ?? []
  const deltaReadings = useMemo(() => toDeltaReadings(readings), [readings])
  const cumulativeWh = getCumulativeWh(readings)
  const totalKWh = cumulativeWh / 1000
  const latestDelta = getLatestDeltaReading(readings)
  const estimatedCost = totalKWh * supplier.rate

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = walletInput.trim()
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setActiveWallet(trimmed)
    }
  }

  const handleSettleTransfer = useCallback(
    async (totalWh: number, amountKwh: number, supplierWallet: string, rate: number) => {
      if (isCustomMode) {
        const res = await fetch(api(`producer?wallet=${encodeURIComponent(supplierWallet)}`))
        if (res.ok) {
          const prod = await res.json()
          const available = Number(prod?.overview?.availableWh ?? 0)
          if (totalWh > available + 0.001) {
            throw new Error(
              `생산자 판매 가능량(${available.toLocaleString()} Wh)보다 정산량(${Math.round(totalWh).toLocaleString()} Wh)이 많습니다.`,
            )
          }
        }
        return wallet.purchaseProducerEnergy(totalWh, supplierWallet)
      }
      return wallet.transferWon(amountKwh, supplierWallet, rate)
    },
    [isCustomMode, wallet],
  )

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
            <input
              type="text"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              placeholder="내 계량기 주소 조회 (0x...)"
              className="w-full pl-9 pr-3 py-2.5 text-sm font-mono bg-bg-base-opaque border border-border-strong rounded-lg text-fg-base placeholder:text-fg-muted focus:outline-none focus:border-brand-100 transition-colors"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 text-sm font-medium bg-brand-100 text-white rounded-lg hover:opacity-90 transition-opacity shrink-0">
            조회
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex flex-col md:flex-row gap-2">
          {Object.values(SUPPLIERS).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setSupplierId(s.id as 'renewable' | 'mixed'); setIsCustomMode(false) }}
              className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border text-left transition-all ${
                !isCustomMode && supplierId === s.id
                  ? 'border-brand-100 bg-brand-10/50 ring-1 ring-brand-100'
                  : 'border-border-strong bg-bg-base-opaque hover:bg-bg-subtle'
              }`}
            >
              <span className="text-xl">{s.emoji}</span>
              <div className="min-w-0">
                <div className={`text-sm font-semibold ${!isCustomMode && supplierId === s.id ? 'text-brand-100' : 'text-fg-base'}`}>{s.label}</div>
                <div className="text-[10px] text-fg-muted">{s.description} · {s.rate}원/kWh</div>
              </div>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setIsCustomMode(true)}
            className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border text-left transition-all ${
              isCustomMode ? 'border-brand-100 bg-brand-10/50 ring-1 ring-brand-100' : 'border-border-strong bg-bg-base-opaque hover:bg-bg-subtle'
            }`}
          >
            <span className="text-xl">🤝</span>
            <div className="min-w-0">
              <div className={`text-sm font-semibold ${isCustomMode ? 'text-brand-100' : 'text-fg-base'}`}>P2P 1:1 직거래 (지갑 검색)</div>
              <div className="text-[10px] text-fg-muted">생산자 지갑 주소로 단가 조회 후 정산</div>
            </div>
          </button>
        </div>

        {isCustomMode && (
          <div className="flex flex-col sm:flex-row gap-2 p-3 border border-brand-100/30 bg-brand-10/10 rounded-lg mt-1">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-100/70" />
              <input
                type="text"
                value={customSupplierWallet}
                onChange={(e) => handleSupplierWalletChange(e.target.value)}
                placeholder="정산할 생산자 지갑 주소 입력 (0x...)"
                className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-bg-base border border-border-strong rounded-md text-fg-base focus:outline-none focus:border-brand-100"
              />
            </div>
            <div className="w-full sm:w-48 relative">
              <input
                type="text"
                readOnly
                value={
                  isFetchingPrice
                    ? '조회 중...'
                    : customSupplierRate !== ''
                      ? `${customSupplierRate} WON/kWh`
                      : '단가 미설정'
                }
                className="w-full pl-3 pr-3 py-2 text-sm font-bold bg-bg-subtle border border-border-strong rounded-md text-fg-base opacity-80 cursor-default"
              />
            </div>
            <p className="text-[10px] text-fg-muted sm:self-center sm:max-w-[140px]">
              단가는 생산자 탭에서만 수정할 수 있습니다.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-tag-orange-100/30 bg-tag-orange-10 flex items-center gap-2 text-xs text-tag-orange-100">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {loading && !data && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-brand-100 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-fg-muted">데이터 조회 중...</span>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard label="누적 전력량" value={`${cumulativeWh.toLocaleString()} Wh`} sub={`${totalKWh.toFixed(4)} kWh`} accent />
            <StatCard
              label="예상 요금"
              value={`${estimatedCost.toLocaleString('ko-KR', { maximumFractionDigits: 3 })}원`}
              sub={`${supplier.emoji} ${supplier.rate} WON/kWh`}
            />
            <StatCard label="전송 횟수" value={`${overview?.totalReadings ?? 0}회`} />
            <StatCard
              label="최근 5분 차분"
              value={latestDelta ? `${latestDelta.wh} Wh` : '-'}
              sub={latestDelta ? formatTimeAgo(latestDelta.timestamp) : '기록 없음'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 space-y-4">
              <EnergyChart
                readings={readings}
                cumulativeBadge={{
                  label: '누적 전력량',
                  kWh: totalKWh,
                  wh: cumulativeWh,
                }}
              />
              <DashboardHeatmap
                title="소비 전력 히트맵"
                readings={deltaReadings}
                anchorDate={weekAnchor}
                onAnchorDateChange={setWeekAnchor}
              />
            </div>
            <div className="space-y-4">
              <LiveReading reading={latestDelta} totalReadings={overview?.totalReadings ?? 0} />
              <DeviceStatus wallet={data.wallet} contract={data.contract} network={network} latestBlock={data.latestBlock} />
            </div>
          </div>

          <div className="mb-4">
            <WeeklySettlement
              readings={deltaReadings}
              settlements={settlementData?.transfers ?? []}
              isWalletConnected={wallet.isConnected && wallet.isCorrectNetwork}
              supplier={supplier}
              payerWallets={payerWallets}
              connectedWallet={wallet.address}
              onTransfer={handleSettleTransfer}
              onSettlementDone={refetchSettlements}
            />
          </div>
          <TransactionTable readings={deltaReadings} showDeltaLabel />
        </>
      )}

      {!data && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Zap className="w-8 h-8 text-fg-muted" />
          <p className="text-sm text-fg-muted">계량기 주소를 입력하여 전력 데이터를 조회하세요</p>
        </div>
      )}
    </>
  )
}

function formatTimeAgo(unixSec: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixSec
  if (diff < 60) return `${diff}초 전`
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}
