import { useState, useEffect } from 'react'
import { writeStoredWallet, STORAGE_PAYER_WALLET } from './lib/presentation'
import { useWallet } from './hooks/useWallet'
import { TooltipProvider } from './components/ui/tooltip'
import WalletButton from './components/WalletButton'
import RoleTabs, { type AppRole } from './components/RoleTabs'
import ConsumerDashboard from './pages/ConsumerDashboard'
import ProducerDashboard from './pages/ProducerDashboard'
import PresentationDashboard from './pages/PresentationDashboard'
import LoveLetterPage from './pages/LoveLetterPage'
import { Zap, AlertCircle } from 'lucide-react'

const ROLE_SUBTITLE: Record<AppRole, string> = {
  consumer: '소비자 · 전력 사용 및 P2P 정산',
  producer: '생산자 · 전력 생산 및 판매 관리',
  presentation: '프레젠테이션 · 태블릿 시연',
  love: 'A little something made with love',
}

export default function App() {
  const [role, setRole] = useState<AppRole>('presentation')
  const wallet = useWallet()
  const isPresentation = role === 'presentation'
  const isLove = role === 'love'

  useEffect(() => {
    if (wallet.address) writeStoredWallet(STORAGE_PAYER_WALLET, wallet.address)
  }, [wallet.address])

  return (
    <TooltipProvider delayDuration={200}>
    <div className={`min-h-screen ${isLove ? 'love-page-shell' : isPresentation ? 'bg-slate-100' : 'bg-bg-chat'}`}>
      <div className={`mx-auto px-4 py-4 md:py-6 ${isPresentation ? 'max-w-7xl' : 'max-w-6xl'}`}>
        <header className={`flex flex-col gap-4 ${isPresentation ? 'mb-3' : 'mb-6'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isPresentation ? 'bg-blue-600 shadow-sm' : 'bg-brand-10'
              }`}>
                <Zap className={`w-5 h-5 ${isPresentation ? 'text-white' : 'text-brand-100'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className={`text-lg font-bold ${isPresentation ? 'text-slate-900' : 'text-fg-base'}`}>
                    에너지 계량기{' '}
                    <span className={`font-normal text-sm ${isPresentation ? 'text-slate-400' : 'text-fg-subtle'}`}>
                      Energy Meter
                    </span>
                  </h1>
                  <span className={`text-xs font-semibold ${isPresentation ? 'text-blue-600' : 'text-[#1d4ed8]'}`}>
                    MVP그리드랩 제작(KMU 캡스톤 디자인)
                  </span>
                </div>
                <p className={`text-xs ${isPresentation ? 'text-slate-500' : 'text-fg-muted'}`}>
                  {ROLE_SUBTITLE[role]}
                </p>
              </div>
            </div>
            <div className={`items-center gap-2 self-end sm:self-auto ${isLove ? 'hidden' : 'flex'}`}>
              <WalletButton wallet={wallet} onConnect={wallet.connect} onDisconnect={wallet.disconnect} />
            </div>
          </div>

          <RoleTabs role={role} onChange={setRole} />

          {!isPresentation && wallet.error && (
            <div className="p-2.5 rounded-lg border border-tag-orange-100/30 bg-tag-orange-10 flex items-center gap-2 text-xs text-tag-orange-100">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {wallet.error}
            </div>
          )}
        </header>

        {role === 'consumer' && <ConsumerDashboard wallet={wallet} />}
        {role === 'producer' && <ProducerDashboard wallet={wallet} />}
        {role === 'presentation' && <PresentationDashboard wallet={wallet} />}
        {role === 'love' && <LoveLetterPage />}

        {!isPresentation && !isLove && (
          <footer className="mt-6 pt-4 border-t border-border-base flex flex-wrap items-center justify-between gap-2 text-[10px] text-fg-muted">
            <span>에너지 계량기 · {ROLE_SUBTITLE[role]}</span>
            <span>Arbitrum Sepolia Testnet</span>
          </footer>
        )}
      </div>
    </div>
    </TooltipProvider>
  )
}
