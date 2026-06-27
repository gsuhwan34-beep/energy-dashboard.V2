import { useState } from 'react'
import { useWallet } from './hooks/useWallet'
import WalletButton from './components/WalletButton'
import RoleTabs, { type AppRole } from './components/RoleTabs'
import ConsumerDashboard from './pages/ConsumerDashboard'
import ProducerDashboard from './pages/ProducerDashboard'
import { Zap, AlertCircle } from 'lucide-react'

export default function App() {
  const [role, setRole] = useState<AppRole>('consumer')
  const wallet = useWallet()

  return (
    <div className="min-h-screen bg-bg-chat">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-brand-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-fg-base">
                    에너지 계량기{' '}
                    <span className="text-fg-subtle font-normal text-sm">Energy Meter</span>
                  </h1>
                  <span className="text-xs font-semibold text-[#1d4ed8]">MVP그리드랩 제작(KMU 캡스톤 디자인)</span>
                </div>
                <p className="text-xs text-fg-muted">
                  {role === 'consumer' ? '소비자 · 전력 사용 및 정산' : '생산자 · 전력 생산 및 판매'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <WalletButton wallet={wallet} onConnect={wallet.connect} onDisconnect={wallet.disconnect} />
            </div>
          </div>

          <RoleTabs role={role} onChange={setRole} />

          {wallet.error && (
            <div className="p-2.5 rounded-lg border border-tag-orange-100/30 bg-tag-orange-10 flex items-center gap-2 text-xs text-tag-orange-100">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {wallet.error}
            </div>
          )}
        </header>

        {role === 'consumer' ? (
          <ConsumerDashboard wallet={wallet} />
        ) : (
          <ProducerDashboard wallet={wallet} />
        )}

        <footer className="mt-6 pt-4 border-t border-border-base flex flex-wrap items-center justify-between gap-2 text-[10px] text-fg-muted">
          <span>에너지 계량기 · {role === 'consumer' ? '소비자 모드' : '생산자 모드'}</span>
          <span>Arbitrum Sepolia Testnet</span>
        </footer>
      </div>
    </div>
  )
}
