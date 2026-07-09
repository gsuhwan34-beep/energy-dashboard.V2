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
import { Zap, Search, AlertCircle, CheckCircle2, Settings } from 'lucide-react'
import { api } from '../lib/api'
import { writeStoredWallet, STORAGE_CONSUMER_WALLET, STORAGE_SUPPLIER_RATE, STORAGE_PAYER_WALLET, resolvePayerWallets, DEMO_CONSUMER_WALLET } from '../lib/presentation'
import { sortReadings, getTotalWh, getLatestReading } from '../lib/readingDelta'

const DEFAULT_WALLET = DEMO_CONSUMER_WALLET

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
  const [confirmedP2pWallet, setConfirmedP2pWallet] = useState<string | null>(null)
  const [confirmedP2pRate, setConfirmedP2pRate] = useState<number | null>(null)
  const [p2pConfigMessage, setP2pConfigMessage] = useState<string | null>(null)
  const [isFetchingPrice, setIsFetchingPrice] = useState(false)
  const [isConfiguringP2p, setIsConfiguringP2p] = useState(false)
  const lastFetchedWalletRef = useRef<string | null>(null)

  const supplier: EnergySupplier = isCustomMode
    ? {
        id: 'custom',
        label: '신규 무허가 공급자 (P2P)',
        emoji: '🤝',
        rate: confirmedP2pRate ?? 0,
        wallet: confirmedP2pWallet ?? '0x0000000000000000000000000000000000000000',
        description: confirmedP2pWallet
          ? `${confirmedP2pWallet.slice(0, 6)}…${confirmedP2pWallet.slice(-4)} · 정산 대상 설정됨`
          : '생산자 지갑 입력 후 「설정」을 눌러 주세요',
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
    payerWallets,
    { ledgerOnly: true },
  )

  const fetchSupplierPrice = useCallback(async (walletAddress: string) => {
    const normalized = walletAddress.toLowerCase()
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) return null
    if (lastFetchedWalletRef.current === normalized) {
      return confirmedP2pRate
    }

    setIsFetchingPrice(true)
    try {
      const res = await fetch(api(`supplier/price/${walletAddress}`))
      if (!res.ok) throw new Error('price fetch failed')
      const resData = await res.json()
      lastFetchedWalletRef.current = normalized
      const onChain = Number(resData.onChainRate)
      const price = Number(resData.price)
      return onChain > 0 ? onChain : price
    } catch (err) {
      console.error('단가 조회 실패:', err)
      return null
    } finally {
      setIsFetchingPrice(false)
    }
  }, [confirmedP2pRate])

  const handleP2pConfigure = useCallback(async () => {
    const trimmed = customSupplierWallet.trim()
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setP2pConfigMessage('유효한 생산자 지갑 주소(0x...)를 입력하세요.')
      setConfirmedP2pWallet(null)
      setConfirmedP2pRate(null)
      return
    }

    setIsConfiguringP2p(true)
    setP2pConfigMessage(null)
    try {
      lastFetchedWalletRef.current = null
      const price = await fetchSupplierPrice(trimmed)
      if (price == null || price <= 0) {
        throw new Error('생산자 단가를 찾을 수 없습니다. 생산자 탭에서 단가를 먼저 저장해 주세요.')
      }
      setConfirmedP2pWallet(trimmed)
      setConfirmedP2pRate(price)
      setP2pConfigMessage(`${trimmed.slice(0, 6)}…${trimmed.slice(-4)} · ${price} WON/kWh · 정산 대상 설정됨`)
    } catch (err: unknown) {
      setConfirmedP2pWallet(null)
      setConfirmedP2pRate(null)
      setP2pConfigMessage(err instanceof Error ? err.message : '설정에 실패했습니다.')
    } finally {
      setIsConfiguringP2p(false)
    }
  }, [customSupplierWallet, fetchSupplierPrice])

  const handleSupplierWalletChange = (value: string) => {
    const next = value.trim()
    if (confirmedP2pWallet && next.toLowerCase() !== confirmedP2pWallet.toLowerCase()) {
      setConfirmedP2pWallet(null)
      setConfirmedP2pRate(null)
      setP2pConfigMessage(null)
      lastFetchedWalletRef.current = null
    }
    setCustomSupplierWallet(value)
  }

  useEffect(() => {
    if (!isCustomMode) {
      setConfirmedP2pWallet(null)
      setConfirmedP2pRate(null)
      setP2pConfigMessage(null)
      lastFetchedWalletRef.current = null
    }
  }, [isCustomMode])

  const overview = data?.overview ?? null
  const readings = data?.readings ?? []
  const sortedReadings = useMemo(() => sortReadings(readings), [readings])
  const totalWh = getTotalWh(readings)
  const totalKWh = totalWh / 1000
  const latestReading = getLatestReading(readings)
  const estimatedCost = totalKWh * supplier.rate

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = walletInput.trim()
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setActiveWallet(trimmed)
    }
  }

  const handleSettleTransfer = useCallback(
    async (totalWh: number, _amountKwh: number, supplierWallet: string, _rate: number) => {
      if (isCustomMode) {
        if (!confirmedP2pWallet) {
          throw new Error('P2P 생산자 지갑을 입력하고 「설정」을 눌러 주세요.')
        }
        const res = await fetch(api(`producer?wallet=${encodeURIComponent(supplierWallet)}`))
        if (res.ok) {
          const prod = await res.json()
          const available = Number(prod?.overview?.availableWh ?? 0)
          if (totalWh > available + 0.001) {
            throw new Error(
              `판매 가능량(${available.toLocaleString()} Wh)보다 정산량(${Math.round(totalWh).toLocaleString()} Wh)이 많습니다.`,
            )
          }
        }
      }
      return wallet.purchaseProducerEnergy(totalWh, supplierWallet)
    },
    [isCustomMode, confirmedP2pWallet, wallet],
  )

  useEffect(() => {
    if (!wallet.isConnected || !wallet.isCorrectNetwork) return
    wallet.ensurePresetLedgerRates().catch(() => {
      // owner가 아니면 무시
    })
  }, [wallet.isConnected, wallet.isCorrectNetwork, wallet.address, wallet.ensurePresetLedgerRates])

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
          <div className="flex flex-col gap-2 p-3 border border-brand-100/30 bg-brand-10/10 rounded-lg mt-1">
            <div className="flex flex-col sm:flex-row gap-2">
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
              <button
                type="button"
                onClick={handleP2pConfigure}
                disabled={isConfiguringP2p || isFetchingPrice}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-brand-100 rounded-md hover:opacity-90 disabled:opacity-50 shrink-0"
              >
                <Settings className="w-4 h-4" />
                {isConfiguringP2p ? '설정 중...' : '설정'}
              </button>
            </div>
            {confirmedP2pWallet && confirmedP2pRate != null && (
              <p className="text-[10px] text-tag-cyan-100 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                정산 대상: <span className="font-mono">{confirmedP2pWallet}</span> · {confirmedP2pRate} WON/kWh
              </p>
            )}
            {p2pConfigMessage && (
              <p className={`text-[10px] flex items-center gap-1 ${p2pConfigMessage.includes('설정됨') ? 'text-tag-cyan-100' : 'text-tag-orange-100'}`}>
                {p2pConfigMessage.includes('설정됨') ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {p2pConfigMessage}
              </p>
            )}
            <p className="text-[10px] text-fg-muted">
              지갑 입력 → 「설정」으로 정산 대상 확정 → 아래 주간 정산에서 「정산하기」
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
            <StatCard label="누적 전력량" value={`${totalWh.toLocaleString()} Wh`} sub={`${totalKWh.toFixed(4)} kWh`} accent />
            <StatCard
              label="예상 요금"
              value={`${estimatedCost.toLocaleString('ko-KR', { maximumFractionDigits: 3 })}원`}
              sub={`${supplier.emoji} ${supplier.rate} WON/kWh`}
            />
            <StatCard label="전송 횟수" value={`${overview?.totalReadings ?? 0}회`} />
            <StatCard
              label="최근 5분 차분"
              value={latestReading ? `${latestReading.wh} Wh` : '-'}
              sub={latestReading ? formatTimeAgo(latestReading.timestamp) : '기록 없음'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 space-y-4">
              <EnergyChart
                readings={readings}
                readingsAreDelta
                cumulativeBadge={{
                  label: '누적 전력량',
                  kWh: totalKWh,
                  wh: totalWh,
                }}
              />
              <DashboardHeatmap
                title="소비 전력 히트맵"
                readings={sortedReadings}
                anchorDate={weekAnchor}
                onAnchorDateChange={setWeekAnchor}
              />
            </div>
            <div className="space-y-4">
              <LiveReading reading={latestReading} totalReadings={overview?.totalReadings ?? 0} />
              <DeviceStatus wallet={data.wallet} contract={data.contract} network={network} latestBlock={data.latestBlock} />
            </div>
          </div>

          <div className="mb-4">
            <WeeklySettlement
              readings={sortedReadings}
              settlements={settlementData?.transfers ?? []}
              isWalletConnected={wallet.isConnected && wallet.isCorrectNetwork}
              supplier={supplier}
              settlementReady={!isCustomMode || Boolean(confirmedP2pWallet)}
              settlementBlockedHint="P2P 생산자 지갑을 입력하고 「설정」을 눌러 주세요."
              onTransfer={handleSettleTransfer}
              onSettlementDone={refetchSettlements}
            />
          </div>
          <TransactionTable readings={sortedReadings} showDeltaLabel />
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
