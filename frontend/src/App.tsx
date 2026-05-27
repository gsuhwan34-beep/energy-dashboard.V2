import { useState } from 'react'
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
import { Zap, RefreshCw, Search, AlertCircle } from 'lucide-react'

const DEFAULT_WALLET = '0x6220F267AEDfB782d8aDD9D13AAB3f5B51c0b3c5'

export default function App() {
  const [walletInput, setWalletInput] = useState(DEFAULT_WALLET)
  const [activeWallet, setActiveWallet] = useState(DEFAULT_WALLET)
  const [supplierId, setSupplierId] = useState<'renewable' | 'mixed'>('renewable')

  const { data, loading, error, refetch } = useEnergyData(activeWallet)
  const { network } = useNetworkStatus()
  const wallet = useWallet()
  const { data: settlementData, refetch: refetchSettlements } = useSettlements()

  const supplier: EnergySupplier = SUPPLIERS[supplierId]
  const overview = data?.overview ?? null
  const readings = data?.readings ?? []

  const totalKWh = overview?.totalKWh ?? 0
  
  // 🔥 [수정 1] Math.round()를 제거하여 소수점 데이터(미세 요금) 증발 방지
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
              <WalletButton
                wallet={wallet}
                onConnect={wallet.connect}
                onDisconnect={wallet.disconnect}
              />
              <button
                onClick={refetch}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-fg-subtle border border-border-strong rounded-lg hover:bg-bg-subtle transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </button>
            </div>
          </div>

          {wallet.error && (
            <div className="p-2.5 rounded-lg border border-tag-orange-100/30 bg-tag-orange-10 flex items-center gap-2 text-xs text-tag-orange-100">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {wallet.error}
            </div>
          )}
        </header>

        {/* 주소 입력 */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
              <input
                type="text"
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                placeholder="계량기 주소 입력 (0x...)"
                className="w-full pl-9 pr-3 py-2.5 text-sm font-mono bg-bg-base-opaque border border-border-strong rounded-lg text-fg-base placeholder:text-fg-muted focus:outline-none focus:border-brand-100 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-medium bg-brand-100 text-white rounded-lg hover:opacity-90 transition-opacity shrink-0"
            >
              조회
            </button>
          </div>
        </form>

        {/* 에너지 공급자 선택 */}
        <div className="flex gap-2 mb-4">
          {Object.values(SUPPLIERS).map((s) => (
            <button
              key={s.id}
              onClick={() => setSupplierId(s.id)}
              className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border text-left transition-all ${
                supplierId === s.id
                  ? 'border-brand-100 bg-bg-base-opaque ring-1 ring-brand-100'
                  : 'border-border-strong bg-bg-base-opaque hover:bg-bg-subtle'
              }`}
            >
              <span className="text-xl">{s.emoji}</span>
              <div className="min-w-0">
                <div className={`text-sm font-semibold ${supplierId === s.id ? 'text-brand-100' : 'text-fg-base'}`}>
                  {s.label}
                </div>
                <div className="text-[10px] text-fg-muted">{s.description} · {s.rate}원/kWh</div>
              </div>
            </button>
          ))}
        </div>

        {/* 오류 */}
        {error && (
          <div className="mb-4 p-3 rounded-lg border border-tag-orange-100/30 bg-tag-orange-10 flex items-center gap-2 text-xs text-tag-orange-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* 로딩 */}
        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-brand-100 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-fg-muted">계량 데이터를 불러오는 중...</span>
          </div>
        )}

        {/* 데이터 표시 */}
        {data && (
          <>
            {/* 요약 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <StatCard
                label="총 전력량"
                value={`${overview?.totalWh ?? 0} Wh`}
                sub={`${totalKWh.toFixed(4)} kWh`}
                accent
              />
              <StatCard
                label="예상 요금"
                // 🔥 [수정 2] 화면 표시 시 소수점 최대 3자리까지 강제 노출 (0.071원 등)
                value={`${estimatedCost.toLocaleString('ko-KR', { maximumFractionDigits: 3 })}원`}
                sub={`${supplier.emoji} ${supplier.rate} WON/kWh`}
              />
              <StatCard
                label="전송 횟수"
                value={`${overview?.totalReadings ?? 0}회`}
              />
              <StatCard
                label="최근 계량"
                value={overview?.lastReading ? `${overview.lastReading.wh} Wh` : '-'}
                sub={overview?.lastReading ? formatTimeAgo(overview.lastReading.timestamp) : '기록 없음'}
              />
            </div>

            {/* 메인 콘텐츠 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div className="lg:col-span-2">
                <EnergyChart readings={readings} />
              </div>
              <div className="space-y-4">
                <LiveReading
                  reading={overview?.lastReading ?? null}
                  totalReadings={overview?.totalReadings ?? 0}
                />
                <DeviceStatus
                  wallet={data.wallet}
                  contract={data.contract}
                  network={network}
                  latestBlock={data.latestBlock}
                />
              </div>
            </div>

            {/* 주간 정산 */}
            <div className="mb-4">
              <WeeklySettlement
                readings={readings}
                settlements={settlementData?.transfers ?? []}
                isWalletConnected={wallet.isConnected && wallet.isCorrectNetwork}
                supplier={supplier}
                onTransfer={wallet.transferWon}
                onSettlementDone={refetchSettlements}
              />
            </div>

            {/* 전송 기록 */}
            <TransactionTable readings={readings} />
          </>
        )}

        {/* 빈 상태 */}
        {!data && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-brand-100 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-fg-muted">계량기 주소를 입력하여 전력 데이터를 조회하세요</p>
          </div>
        )}

        {/* 푸터 */}
        <footer className="mt-6 pt-4 border-t border-border-base flex flex-wrap items-center justify-between gap-2 text-[10px] text-fg-muted">
          <span>에너지 계량기 &middot; 실시간 전력 계량 시스템</span>
          <span>Arbitrum Sepolia Testnet</span>
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
