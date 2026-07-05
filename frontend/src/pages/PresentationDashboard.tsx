import type { useWallet } from '../hooks/useWallet'
import CoreValuesBento from '../components/presentation/CoreValuesBento'

type WalletHook = ReturnType<typeof useWallet>

interface Props {
  wallet: WalletHook
}

export default function PresentationDashboard(_props: Props) {
  return (
    <div className="presentation-mode -mx-4 md:-mx-0">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[calc(100vh-10rem)]">
        <CoreValuesBento />
      </div>
    </div>
  )
}
