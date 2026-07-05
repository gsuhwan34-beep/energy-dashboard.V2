import { useState } from 'react'
import type { useWallet } from '../hooks/useWallet'
import LiveVerificationFlow from '../components/presentation/LiveVerificationFlow'
import WhyThisSystem from '../components/presentation/WhyThisSystem'
import CoreValuesBento from '../components/presentation/CoreValuesBento'

type WalletHook = ReturnType<typeof useWallet>
type SubTab = 'flow' | 'values' | 'why'

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'flow', label: 'Live Verification Flow' },
  { id: 'values', label: '핵심 가치 5선' },
  { id: 'why', label: '왜 필요한가' },
]

interface Props {
  wallet: WalletHook
}

export default function PresentationDashboard(_props: Props) {
  const [subTab, setSubTab] = useState<SubTab>('flow')

  return (
    <div className="presentation-mode -mx-4 md:-mx-0">
      <div className="bg-slate-950 rounded-2xl border border-white/10 overflow-hidden min-h-[calc(100vh-11rem)] md:min-h-[calc(100vh-10rem)]">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base md:text-lg font-bold text-white tracking-tight">
            한눈에 보기 · 태블릿 시연
          </h2>
          <div className="flex p-0.5 rounded-lg bg-white/5 border border-white/10">
            {SUB_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`px-3 md:px-4 py-2 rounded-md text-[11px] md:text-sm font-bold transition-all whitespace-nowrap ${
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

        <div className={subTab === 'values' ? 'p-0' : 'p-4 md:p-6'}>
          {subTab === 'flow' && <LiveVerificationFlow />}
          {subTab === 'values' && <CoreValuesBento />}
          {subTab === 'why' && <WhyThisSystem />}
        </div>
      </div>
    </div>
  )
}
