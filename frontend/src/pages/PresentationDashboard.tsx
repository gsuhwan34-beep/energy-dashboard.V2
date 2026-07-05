import type { useWallet } from '../hooks/useWallet'
import CoreValuesBento from '../components/presentation/CoreValuesBento'

type WalletHook = ReturnType<typeof useWallet>

interface Props {
  wallet: WalletHook
}

export default function PresentationDashboard(_props: Props) {
  return (
    <div className="presentation-mode -mx-4 md:-mx-0">
      <div className="bg-slate-950 rounded-2xl border border-white/10 overflow-hidden min-h-[calc(100vh-11rem)] md:min-h-[calc(100vh-10rem)]">
        <CoreValuesBento />
      </div>
    </div>
  )
}
