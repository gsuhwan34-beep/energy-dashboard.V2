import { useState, useEffect, useRef, useCallback } from 'react'
import { useProducerData } from '../hooks/useProducerData'
import { useNetworkStatus } from '../hooks/useEnergyData'
import type { useWallet } from '../hooks/useWallet'
import StatCard from '../components/StatCard'
import DeviceStatus from '../components/DeviceStatus'
import EnergyChart from '../components/EnergyChart'
import DashboardHeatmap from '../components/DashboardHeatmap'
import TransactionTable from '../components/TransactionTable'
import ProducerSalesTable from '../components/ProducerSalesTable'
import { Sun, RefreshCw, Search, AlertCircle, Save, Wallet, CheckCircle2 } from 'lucide-react'
import { api } from '../lib/api'
import { writeStoredWallet, STORAGE_PRODUCER_WALLET, STORAGE_SUPPLIER_RATE, DEFAULT_PRODUCER_WALLET } from '../lib/presentation'

type WalletHook = ReturnType<typeof useWallet>

interface Props {
  wallet: WalletHook
}

function supplierPriceStorageKey(addr: string) {
  return `p2p-supplier-price:${addr.toLowerCase()}`
}

function writeStoredPrice(addr: string, price: number) {
  try {
    localStorage.setItem(supplierPriceStorageKey(addr), String(price))
    localStorage.setItem(STORAGE_SUPPLIER_RATE, String(price))
  } catch {
    // ignore
  }
}

export default function ProducerDashboard({ wallet }: Props) {
  const [walletInput, setWalletInput] = useState(DEFAULT_PRODUCER_WALLET)
  const [activeWallet, setActiveWallet] = useState(DEFAULT_PRODUCER_WALLET)
  const [weekAnchor, setWeekAnchor] = useState(() => new Date())
  const [unitRate, setUnitRate] = useState<number | ''>(150)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const priceDirtyRef = useRef(false)

  const canEditPrice = Boolean(wallet.isConnected && wallet.address)

  const { data, loading, error, refetch } = useProducerData(activeWallet)
  const { network } = useNetworkStatus()

  useEffect(() => {
    if (wallet.address && !activeWallet) {
      setWalletInput(wallet.address)
      setActiveWallet(wallet.address)
    }
  }, [wallet.address, activeWallet])

  useEffect(() => {
    writeStoredWallet(STORAGE_PRODUCER_WALLET, activeWallet || DEFAULT_PRODUCER_WALLET)
  }, [activeWallet])

  useEffect(() => {
    if (data?.ratePerKwh != null && !priceDirtyRef.current && canEditPrice) {
      setUnitRate(data.ratePerKwh)
    }
  }, [data?.ratePerKwh, canEditPrice])

  useEffect(() => {
    if (!canEditPrice || !wallet.address) return
    fetch(api(`supplier/price/${wallet.address}`))
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.price != null && !priceDirtyRef.current) {
          setUnitRate(Number(json.price))
        }
      })
      .catch(() => {})
  }, [canEditPrice, wallet.address])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = walletInput.trim()
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      priceDirtyRef.current = false
      setActiveWallet(trimmed)
    }
  }

  const handleSavePrice = useCallback(async () => {
    if (!wallet.address || unitRate === '' || !canEditPrice) return
    setIsSaving(true)
    setSaveMessage(null)
    try {
      const res = await fetch(api('supplier/price'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: wallet.address, price: unitRate }),
      })
      if (!res.ok) throw new Error('save failed')
      writeStoredPrice(wallet.address, Number(unitRate))
      await wallet.setProducerRateOnChain(Number(unitRate))
      priceDirtyRef.current = false
      setSaveMessage(`${unitRate} WON/kWh 저장 (웹 + 온체인 단가)`)
      refetch()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '단가 저장에 실패했습니다.'
      setSaveMessage(msg.includes('save failed') ? '단가 저장에 실패했습니다.' : msg)
    } finally {
      setIsSaving(false)
    }
  }, [wallet, unitRate, canEditPrice, refetch])

  const overview = data?.overview

  const productions = data?.productions ?? []
  const totalProductionKWh = overview?.totalProductionKWh ?? 0
  const totalProducedWh = overview?.totalWh ?? 0
  const soldKWh = overview?.soldKWh ?? 0
  const availableKWh = overview?.availableKWh ?? 0
  const availableWh = overview?.availableWh ?? 0

  return (
    <>
      {!wallet.isConnected && (
        <div className="mb-4 p-3 rounded-lg border border-tag-blue-100/30 bg-tag-blue-10 flex items-center gap-2 text-xs text-tag-blue-100">
          <Wallet className="w-4 h-4 shrink-0" />
          생산자 대시보드를 이용하려면 MetaMask를 연결하거나 생산자 지갑 주소를 조회하세요.
        </div>
      )}

      {canEditPrice && (
        <div className="mb-4 flex flex-col sm:flex-row gap-3 p-3 border border-brand-100/40 bg-brand-10/20 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-brand-100 mb-1">내 판매 단가 설정</p>
            <p className="text-[10px] text-fg-muted">
              연결 지갑 <span className="font-mono">{wallet.address?.slice(0, 6)}…{wallet.address?.slice(-4)}</span>
              {' '}· 저장 시 온체인 단가 등록 · P2P 정산에 사용
            </p>
            {saveMessage && (
              <p className={`text-[10px] mt-1 flex items-center gap-1 ${saveMessage.includes('실패') || saveMessage.includes('없습니다') ? 'text-tag-orange-100' : 'text-tag-cyan-100'}`}>
                {saveMessage.includes('실패') || saveMessage.includes('없습니다') ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                {saveMessage}
              </p>
            )}
          </div>
          <div className="flex gap-2 items-center shrink-0">
            <div className="relative w-36">
              <input
                type="number"
                value={unitRate === '' ? '' : unitRate}
                onChange={(e) => {
                  priceDirtyRef.current = true
                  setSaveMessage(null)
                  setUnitRate(e.target.value === '' ? '' : Number(e.target.value))
                }}
                className="w-full pl-3 pr-10 py-2 text-sm font-bold bg-bg-base border border-brand-100/50 rounded-md text-brand-100 focus:outline-none focus:border-brand-100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-fg-muted font-bold">WON</span>
            </div>
            <button
              type="button"
              onClick={handleSavePrice}
              disabled={isSaving || unitRate === ''}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-brand-100 rounded-md hover:opacity-90 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
            <input
              type="text"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              placeholder="내 생산자(발전소) 지갑 주소 (0x...)"
              className="w-full pl-9 pr-3 py-2.5 text-sm font-mono bg-bg-base-opaque border border-border-strong rounded-lg text-fg-base placeholder:text-fg-muted focus:outline-none focus:border-brand-100 transition-colors"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 text-sm font-medium bg-brand-100 text-white rounded-lg hover:opacity-90 shrink-0">
            조회
          </button>
          {activeWallet && (
            <button
              type="button"
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-fg-subtle border border-border-strong rounded-lg hover:bg-bg-subtle disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-tag-orange-100/30 bg-tag-orange-10 flex items-center gap-2 text-xs text-tag-orange-100">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {loading && !data && activeWallet && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-brand-100 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-fg-muted">생산 데이터 조회 중...</span>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <StatCard
              label="총 생산량"
              value={`${totalProductionKWh.toFixed(4)} kWh`}
              sub={`${totalProducedWh.toLocaleString()} Wh · IoT 미터 온체인 ${overview?.totalReadings ?? 0}회`}
              accent
            />
            <StatCard
              label="판매 완료량"
              value={`${soldKWh.toFixed(4)} kWh`}
              sub={`${overview?.verifiedSaleCount ?? 0}건 · ${overview?.totalWonReceived.toLocaleString('ko-KR', { maximumFractionDigits: 2 }) ?? 0} WON`}
            />
            <StatCard
              label="판매 가능 잔여량"
              value={`${availableKWh.toFixed(4)} kWh`}
              sub={`${availableWh.toLocaleString()} Wh · IoT 생산 − WON 판매`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 space-y-4">
              <EnergyChart
                readings={productions}
                readingsAreDelta
                volumeLabel="5분 발전량"
                chartTitle="발전량 차트"
                cumulativeBadge={{
                  label: '판매 가능 잔여',
                  kWh: availableKWh,
                  wh: availableWh,
                  hint: `총 ${totalProducedWh.toLocaleString()} Wh · 판매 ${overview?.soldWh?.toLocaleString() ?? 0} Wh`,
                }}
              />
              <DashboardHeatmap
                title="생산 전력 히트맵"
                readings={productions}
                anchorDate={weekAnchor}
                onAnchorDateChange={setWeekAnchor}
              />
            </div>
            <DeviceStatus
              wallet={data.wallet}
              contract={data.contract}
              network={network}
              latestBlock={data.latestBlock}
            />
          </div>

          <div className="mb-4">
            <ProducerSalesTable
              sales={data.sales}
              verifiedCount={overview?.verifiedSaleCount ?? 0}
              rawInboundCount={overview?.rawInboundCount ?? 0}
            />
          </div>

          <TransactionTable
            readings={productions}
            title="온체인 발전 기록"
            whColumnLabel="5분 발전량 (Wh)"
            showDeltaLabel
          />
        </>
      )}

      {!data && !loading && !error && !activeWallet && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Sun className="w-8 h-8 text-fg-muted" />
          <p className="text-sm text-fg-muted">생산자 지갑 주소를 입력하거나 MetaMask를 연결하세요</p>
        </div>
      )}
    </>
  )
}
