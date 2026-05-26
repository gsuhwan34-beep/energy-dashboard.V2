import type { NetworkInfo } from '../hooks/useEnergyData'
import { Globe, Cpu } from 'lucide-react'

interface Props {
  wallet: string
  contract: string
  network: NetworkInfo | null
  latestBlock?: number
}

export default function DeviceStatus({ wallet, contract, network, latestBlock }: Props) {
  const isConnected = network?.status === 'connected'

  return (
    <div className="border border-border-strong rounded-lg bg-bg-base-opaque p-4">
      {/* 계량기 정보 */}
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="w-4 h-4 text-fg-subtle" />
        <h3 className="text-sm font-semibold text-fg-base">계량기 정보</h3>
      </div>
      <div className="space-y-2 text-xs">
        <Row label="계량기 주소" value={shortAddr(wallet)} full={wallet} />
        <Row label="컨트랙트" value={shortAddr(contract)} full={contract} />
      </div>

      {/* 네트워크 상태 */}
      <div className="border-t border-border-base mt-3 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-fg-subtle" />
            <h4 className="text-xs font-semibold text-fg-base">네트워크</h4>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
            isConnected ? 'bg-tag-cyan-10 text-tag-cyan-100' : 'bg-tag-orange-10 text-tag-orange-100'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-tag-cyan-100' : 'bg-tag-orange-100'}`} />
            {isConnected ? '연결됨' : '연결 끊김'}
          </span>
        </div>
        <div className="space-y-2 text-xs">
          <Row label="체인" value={network?.network || 'Arbitrum Sepolia'} />
          {(latestBlock || network?.latestBlock) && (
            <Row label="최신 블록" value={`#${(latestBlock || network?.latestBlock || 0).toLocaleString()}`} />
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, full }: { label: string; value: string; full?: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-fg-muted shrink-0">{label}</span>
      {full ? (
        <a
          href={`https://sepolia.arbiscan.io/address/${full}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-100 font-mono truncate hover:underline"
          title={full}
        >
          {value}
        </a>
      ) : (
        <span className="text-fg-subtle font-mono truncate">{value}</span>
      )}
    </div>
  )
}

function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
