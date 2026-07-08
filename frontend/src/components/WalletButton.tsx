import { Wallet, LogOut, Loader2, AlertTriangle, Smartphone, Monitor } from 'lucide-react'
import type { WalletState } from '../hooks/useWallet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface Props {
  wallet: WalletState & {
    connectInjected?: () => void
    connectMobile?: () => void
  }
  onConnect: () => void
  onDisconnect: () => void
}

function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function connectionLabel(mode: WalletState['connectionMode']) {
  if (mode === 'walletconnect') return '모바일 지갑'
  if (mode === 'injected') return '브라우저 지갑'
  return null
}

export default function WalletButton({ wallet, onConnect, onDisconnect }: Props) {
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

  if (wallet.isConnected && wallet.address) {
    const label = connectionLabel(wallet.connectionMode)

    return (
      <div className="flex items-center gap-2">
        {!wallet.isCorrectNetwork && (
          <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-full bg-tag-orange-10 text-tag-orange-100">
            <AlertTriangle className="w-3 h-3" />
            네트워크 변경 필요
          </span>
        )}

        <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-border-strong rounded-lg bg-bg-base-opaque text-fg-subtle">
          <span className={`w-2 h-2 rounded-full ${wallet.isCorrectNetwork ? 'bg-tag-cyan-100' : 'bg-tag-orange-100'}`} />
          {shortAddr(wallet.address)}
          {label && (
            <span className="text-[10px] text-fg-muted font-sans">{label}</span>
          )}
        </span>

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

  const showConnectMenu = wallet.hasInjectedWallet && !wallet.isMobileBrowser

  if (showConnectMenu && wallet.connectInjected && wallet.connectMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-100 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Wallet className="w-3.5 h-3.5" />
            지갑 연결
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={wallet.connectInjected} className="cursor-pointer">
            <Monitor className="w-4 h-4" />
            브라우저 확장 프로그램
          </DropdownMenuItem>
          <DropdownMenuItem onClick={wallet.connectMobile} className="cursor-pointer">
            <Smartphone className="w-4 h-4" />
            모바일 지갑 (WalletConnect)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <button
      onClick={onConnect}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-100 text-white rounded-lg hover:opacity-90 transition-opacity"
    >
      {wallet.isMobileBrowser ? <Smartphone className="w-3.5 h-3.5" /> : <Wallet className="w-3.5 h-3.5" />}
      {wallet.isMobileBrowser ? '모바일 지갑 연결' : '지갑 연결'}
    </button>
  )
}
