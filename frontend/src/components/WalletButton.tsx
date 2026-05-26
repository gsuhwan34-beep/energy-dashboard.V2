import { Wallet, LogOut, Loader2, AlertTriangle } from 'lucide-react'
import type { WalletState } from '../hooks/useWallet'

interface Props {
  wallet: WalletState
  onConnect: () => void
  onDisconnect: () => void
}

function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function WalletButton({ wallet, onConnect, onDisconnect }: Props) {
  // 연결 중
  if (wallet.isConnecting) {
    return (
      <button
        disabled
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border-strong rounded-lg bg-bg-subtle text-fg-muted cursor-wait"
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        연결 중...
      </button>
    )
  }

  // 연결됨
  if (wallet.isConnected && wallet.address) {
    return (
      <div className="flex items-center gap-2">
        {/* 네트워크 상태 */}
        {!wallet.isCorrectNetwork && (
          <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-full bg-tag-orange-10 text-tag-orange-100">
            <AlertTriangle className="w-3 h-3" />
            네트워크 변경 필요
          </span>
        )}

        {/* 주소 표시 */}
        <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-border-strong rounded-lg bg-bg-base-opaque text-fg-subtle">
          <span className={`w-2 h-2 rounded-full ${wallet.isCorrectNetwork ? 'bg-tag-cyan-100' : 'bg-tag-orange-100'}`} />
          {shortAddr(wallet.address)}
        </span>

        {/* 연결 해제 */}
        <button
          onClick={onDisconnect}
          className="flex items-center gap-1 px-2 py-1.5 text-xs text-fg-muted hover:text-fg-subtle border border-border-strong rounded-lg hover:bg-bg-subtle transition-colors"
          title="지갑 연결 해제"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  // 미연결
  return (
    <button
      onClick={onConnect}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-100 text-white rounded-lg hover:opacity-90 transition-opacity"
    >
      <Wallet className="w-3.5 h-3.5" />
      지갑 연결
    </button>
  )
}
