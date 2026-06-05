import { useState, useEffect } from 'react'
import { useEnergyData, useNetworkStatus, useSettlements } from './hooks/useEnergyData'
import { useWallet, SUPPLIERS } from './hooks/useWallet'
import type { EnergySupplier } from './hooks/useWallet'
import StatCard from './components/StatCard'
import DeviceStatus from './components/DeviceStatus'
import LiveReading from './components/LiveReading'
import EnergyChart from './components/EnergyChart'
import TransactionTable from './components/TransactionTable'
import WeeklySettlement from './components/WeeklySettlement'
import WalletButton from './components/WalletButton'
import { Zap, RefreshCw, Search, AlertCircle, Save } from 'lucide-react'

const DEFAULT_WALLET = '0x6220F267AEDfB782d8aDD9D13AAB3f5B51c0b3c5'

// 🚨 [필수 확인] 여기에 대표님의 실제 Render 백엔드 주소를 넣어주세요! 
const BACKEND_URL = 'https://energy-dashboard-v2.onrender.com'

export default function App() {
  const [walletInput, setWalletInput] = useState(DEFAULT_WALLET)
  const [activeWallet, setActiveWallet] = useState(DEFAULT_WALLET)
  
  // 🔥 [P2P 공급자 상태 관리]
  const [supplierId, setSupplierId] = useState<'renewable' | 'mixed'>('renewable')
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [customSupplierWallet, setCustomSupplierWallet] = useState('')
  const [customSupplierRate, setCustomSupplierRate] = useState<number | ''>(150)
  const [isFetchingPrice, setIsFetchingPrice] = useState(false)

  const { data, loading, error, refetch } = useEnergyData(activeWallet)
  const { network } = useNetworkStatus()
  const wallet = useWallet()
  const { data: settlementData, refetch: refetchSettlements } = useSettlements()

  const isMyWallet = Boolean(
    wallet.isConnected && 
    wallet.address && 
    customSupplierWallet && 
    wallet.address.toLowerCase() === customSupplierWallet.toLowerCase()
  )

  useEffect(() => {
    const trimmed = customSupplierWallet.trim()
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setIsFetchingPrice(true)
      fetch(`${BACKEND_URL}/api/supplier/price/${trimmed}`)
        .then(res => res.json())
        .then(resData => {
          setCustomSupplierRate(resData.price)
        })
        .catch(err => console.error("단가 조회 실패:", err))
        .finally(() => setIsFetchingPrice(false))
    }
  }, [customSupplierWallet])

  const handleSavePrice = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/supplier/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: wallet.address, price: customSupplierRate })
      })
      // 🔥 [단어 수정 완료] '호가창' 삭제, '단가 등록'으로 변경
      alert(`🎉 성공!\n내 발전소 단가가 [ ${customSupplierRate} WON/kWh ] 로 정상 등록되었습니다.\n이제 다른 사용자가 내 지갑을 검색하면 이 가격으로 자동 결제됩니다.`)
    } catch (err) {
      alert('단가 등록에 실패했습니다. 백엔드 연결 상태를 확인해주세요.')
    }
  }

  const supplier: EnergySupplier = isCustomMode
    ? {
        id: 'custom',
        // 🔥 [단어 수정 완료] '호가 등록 모드' -> '단가 설정 모드'
        label: isMyWallet ? '내 발전소 (단가 설정 모드)' : '신규 무허가 공급자 (P2P)',
        emoji: isMyWallet ? '👑' : '🤝',
        rate: Number(customSupplierRate) || 0,
        wallet: customSupplierWallet || '0x0000000000000000000000000000000000000000',
        description: isMyWallet ? '시장에 판매할 에너지 단가를 설정하세요' : '공급자가 설정한 단가로 자동 정산됩니다'
      }
    : SUPPLIERS[supplierId]

  const overview = data?.overview ?? null
  const readings = data?.readings ?? []

  const totalKWh = overview?.totalKWh ?? 0
  const estimatedCost = totalKWh * supplier.rate

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = walletInput.trim()
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setActiveWallet(trimmed)
    }
  }

  return (
    <div className="min-h-screen bg-bg-chat">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <header className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-brand-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-fg-base">
                    에너지 계량기 <span className="text-fg-subtle font-normal text-sm">Energy Meter</span>
                  </h1>
                  <span className="text-xs font-semibold text-[#1d4ed8]">MVP그리드랩 제작(KMU 캡스톤 디자인)</span>
                </div>
                <p className="text-xs text-fg-muted">실시간 전력 계량 대시보드</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <WalletButton wallet={wallet} onConnect={wallet.connect} onDisconnect={wallet.disconnect} />
              <button onClick={refetch} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-fg-subtle border border-border-strong rounded-lg hover:bg-bg-subtle transition-colors disabled:opacity-50">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> 새로고침
              </button>
            </div>
          </div>
          {wallet.error && (
            <div className="p-2.5 rounded-lg border border-tag-orange-100/30 bg-tag-orange-10 flex items-center gap-2 text-xs text-tag-orange-100">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {wallet.error}
            </div>
          )}
        </header>

        {/* 내 계량기 주소 조회 */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
              <input type="text" value={walletInput} onChange={(e) => setWalletInput(e.target.value)} placeholder="내 계량기 주소 조회 (0x...)" className="w-full pl-9 pr-3 py-2.5 text-sm font-mono bg-bg-base-opaque border border-border-strong rounded-lg text-fg-base placeholder:text-fg-muted focus:outline-none focus:border-brand-100 transition-colors" />
            </div>
            <button type="submit" className="px-4 py-2.5 text-sm font-medium bg-brand-100 text-white rounded-lg hover:opacity-90 transition-opacity shrink-0">조회</button>
          </div>
        </form>

        {/* 에너지 공급자 선택 (프리셋 + P2P 직거래) */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex flex-col md:flex-row gap-2">
            {Object.values(SUPPLIERS).map((s) => (
              <button key={s.id} onClick={() => { setSupplierId(s.id as 'renewable' | 'mixed'); setIsCustomMode(false); }} className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border text-left transition-all ${!isCustomMode && supplierId === s.id ? 'border-brand-100 bg-brand-10/50 ring-1 ring-brand-100' : 'border-border-strong bg-bg-base-opaque hover:bg-bg-subtle'}`}>
                <span className="text-xl">{s.emoji}</span>
                <div className="min-w-0">
                  <div className={`text-sm font-semibold ${!isCustomMode && supplierId === s.id ? 'text-brand-100' : 'text-fg-base'}`}>{s.label}</div>
                  <div className="text-[10px] text-fg-muted">{s.description} · {s.rate}원/kWh</div>
                </div>
              </button>
            ))}
            
            {/* 🔥 [단어 수정 완료] '호가창' -> '1:1 직거래' */}
            <button onClick={() => setIsCustomMode(true)} className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border text-left transition-all ${isCustomMode ? 'border-brand-100 bg-brand-10/50 ring-1 ring-brand-100' : 'border-border-strong bg-bg-base-opaque hover:bg-bg-subtle'}`}>
              <span className="text-xl">🤝</span>
              <div className="min-w-0">
                <div className={`text-sm font-semibold ${isCustomMode ? 'text-brand-100' : 'text-fg-base'}`}>P2P 1:1 직거래 (지갑 검색)</div>
                <div className="text-[10px] text-fg-muted">지갑 주소로 생산자 단가 실시간 조회</div>
              </div>
            </button>
          </div>

          {/* P2P 직거래 세부 입력 폼 */}
          {isCustomMode && (
            <div className={`flex flex-col sm:flex-row gap-2 p-3 border rounded-lg animate-in fade-in slide-in-from-top-2 mt-1 transition-colors ${isMyWallet ? 'border-brand-100/60 bg-brand-10/20' : 'border-brand-100/30 bg-brand-10/10'}`}>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-100/70" />
                <input 
                  type="text" 
                  value={customSupplierWallet} 
                  onChange={(e) => setCustomSupplierWallet(e.target.value)} 
                  placeholder="정산할 공급자의 지갑 주소 (또는 내 지갑) 입력 (0x...)" 
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-bg-base border border-border-strong rounded-md text-fg-base focus:outline-none focus:border-brand-100" 
                />
              </div>
              
              <div className="w-full sm:w-56 relative flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="number" 
                    value={customSupplierRate === '' ? '' : customSupplierRate} 
                    onChange={(e) => setCustomSupplierRate(e.target.value === '' ? '' : Number(e.target.value))} 
                    disabled={!isMyWallet} 
                    placeholder={isFetchingPrice ? "조회 중..." : "단가"} 
                    className={`w-full pl-3 pr-10 py-2 text-sm font-bold bg-bg-base border rounded-md text-fg-base focus:outline-none transition-all ${isMyWallet ? 'border-brand-100/50 focus:border-brand-100 text-brand-100' : 'border-border-strong opacity-70 bg-bg-subtle cursor-not-allowed'}`} 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-fg-muted font-bold">WON</span>
                </div>
                {isMyWallet && (
                  <button onClick={handleSavePrice} className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-white bg-brand-100 rounded-md hover:opacity-90 shrink-0 shadow-sm transition-all">
                    <Save className="w-3.5 h-3.5" /> 저장
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {error && <div className="mb-4 p-3 rounded-lg border border-tag-orange-100/30 bg-tag-orange-10 flex items-center gap-2 text-xs text-tag-orange-100"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
        {loading && !data && <div className="flex flex-col items-center justify-center py-20 gap-3"><div className="w-8 h-8 border-2 border-brand-100 border-t-transparent rounded-full animate-spin" /><span className="text-sm text-fg-muted">데이터 조회 중...</span></div>}

        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <StatCard label="총 전력량" value={`${overview?.totalWh ?? 0} Wh`} sub={`${totalKWh.toFixed(4)} kWh`} accent />
              <StatCard 
                label="예상 요금" 
                value={`${estimatedCost.toLocaleString('ko-KR', { maximumFractionDigits: 3 })}원`} 
                sub={`${supplier.emoji} ${supplier.rate} WON/kWh`} 
              />
              <StatCard label="전송 횟수" value={`${overview?.totalReadings ?? 0}회`} />
              <StatCard label="최근 계량" value={overview?.lastReading ? `${overview.lastReading.wh} Wh` : '-'} sub={overview?.lastReading ? formatTimeAgo(overview.lastReading.timestamp) : '기록 없음'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div className="lg:col-span-2"><EnergyChart readings={readings} /></div>
              <div className="space-y-4">
                <LiveReading reading={overview?.lastReading ?? null} totalReadings={overview?.totalReadings ?? 0} />
                <DeviceStatus wallet={data.wallet} contract={data.contract} network={network} latestBlock={data.latestBlock} />
              </div>
            </div>

            <div className="mb-4">
              <WeeklySettlement readings={readings} settlements={settlementData?.transfers ?? []} isWalletConnected={wallet.isConnected && wallet.isCorrectNetwork} supplier={supplier} onTransfer={wallet.transferWon} onSettlementDone={refetchSettlements} />
            </div>
            <TransactionTable readings={readings} />
          </>
        )}

        {!data && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3"><Zap className="w-8 h-8 text-fg-muted" /><p className="text-sm text-fg-muted">계량기 주소를 입력하여 전력 데이터를 조회하세요</p></div>
        )}

        <footer className="mt-6 pt-4 border-t border-border-base flex flex-wrap items-center justify-between gap-2 text-[10px] text-fg-muted">
          <span>에너지 계량기 &middot; 실시간 전력 계량 시스템</span><span>Arbitrum Sepolia Testnet</span>
        </footer>
      </div>
    </div>
  )
}

function formatTimeAgo(unixSec: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixSec
  if (diff < 60) return `${diff}초 전`
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}
