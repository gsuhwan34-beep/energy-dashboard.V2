import { useState, useEffect, useRef, useCallback } from 'react'
import { useProducerData } from '../hooks/useProducerData'
import { useNetworkStatus } from '../hooks/useEnergyData'
import type { useWallet } from '../hooks/useWallet'
import StatCard from '../components/StatCard'
import DeviceStatus from '../components/DeviceStatus'
import EnergyChart from '../components/EnergyChart'
import TransactionTable from '../components/TransactionTable'
import ProducerSalesTable from '../components/ProducerSalesTable'
import { Sun, RefreshCw, Search, AlertCircle, Save, Wallet } from 'lucide-react'
import { api } from '../lib/api'

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
  } catch {
    // ignore
  }
}

export default function ProducerDashboard({ wallet }: Props) {
  const [walletInput, setWalletInput] = useState('')
  const [activeWallet, setActiveWallet] = useState('')
  const [unitRate, setUnitRate] = useState<number | ''>(150)
  const [isSaving, setIsSaving] = useState(false)
  const priceDirtyRef = useRef(false)

  const isOwnWallet = Boolean(
    wallet.isConnected &&
    wallet.address &&
    activeWallet &&
    wallet.address.toLowerCase() === activeWallet.toLowerCase(),
  )

  const { data, loading, error, refetch } = useProducerData(activeWallet)
  const { network } = useNetworkStatus()

  useEffect(() => {
    if (wallet.address && !activeWallet) {
      setWalletInput(wallet.address)
      setActiveWallet(wallet.address)
    }
  }, [wallet.address, activeWallet])

  useEffect(() => {
    if (data?.ratePerKwh != null && !priceDirtyRef.current) {
      setUnitRate(data.ratePerKwh)
    }
  }, [data?.ratePerKwh])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = walletInput.trim()
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      priceDirtyRef.current = false
      setActiveWallet(trimmed)
    }
  }

  const handleSavePrice = useCallback(async () => {
    if (!wallet.address || unitRate === '' || !isOwnWallet) return
    setIsSaving(true)
    try {
      await fetch(api('supplier/price'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: wallet.address, price: unitRate }),
      })
      writeStoredPrice(wallet.address, Number(unitRate))
      priceDirtyRef.current = false
      alert(`단가가 ${unitRate} WON/kWh 로 저장되었습니다.`)
      refetch()
    } catch {
      alert('단가 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }, [wallet.address, unitRate, isOwnWallet, refetch])

  const overview = data?.overview
  const productions = data?.productions ?? []

  return (
    <>
      {!wallet.isConnected && (
        <div className="mb-4 p-3 rounded-lg border border-tag-blue-100/30 bg-tag-blue-10 flex items-center gap-2 text-xs text-tag-blue-100">
          <Wallet className="w-4 h-4 shrink-0" />
          생산자 대시보드를 이용하려면 MetaMask를 연결하거나 생산자 지갑 주소를 조회하세요.
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

      {isOwnWallet && (
        <div className="mb-4 flex flex-col sm:flex-row gap-2 p-3 border border-brand-100/40 bg-brand-10/20 rounded-lg">
          <div className="flex-1">
            <p className="text-xs font-semibold text-brand-100 mb-1">판매 단가 설정</p>
            <p className="text-[10px] text-fg-muted">소비자가 P2P 검색 시 이 가격으로 정산됩니다.</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative w-36">
              <input
                type="number"
                value={unitRate === '' ? '' : unitRate}
                onChange={(e) => {
                  priceDirtyRef.current = true
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
              value={`${overview?.totalProductionKWh.toFixed(4) ?? 0} kWh`}
              sub={`${overview?.totalWh.toLocaleString() ?? 0} Wh · ${overview?.totalReadings ?? 0}회 기록`}
              accent
            />
            <StatCard
              label="판매 완료량"
              value={`${overview?.soldKWh.toFixed(4) ?? 0} kWh`}
              sub={`${overview?.totalWonReceived.toLocaleString('ko-KR', { maximumFractionDigits: 2 }) ?? 0} WON 수신 · ${data.ratePerKwh} WON/kWh`}
            />
            <StatCard
              label="판매 가능 잔여량"
              value={`${overview?.availableKWh.toFixed(4) ?? 0} kWh`}
              sub={`${overview?.availableWh.toLocaleString() ?? 0} Wh 남음`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2">
              <EnergyChart readings={productions} />
            </div>
            <DeviceStatus
              wallet={data.wallet}
              contract={data.contract}
              network={network}
              latestBlock={data.latestBlock}
            />
          </div>

          <div className="mb-4">
            <ProducerSalesTable sales={data.sales} ratePerKwh={data.ratePerKwh} />
          </div>

          <TransactionTable readings={productions} />
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
