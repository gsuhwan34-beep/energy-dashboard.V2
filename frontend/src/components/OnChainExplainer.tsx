import { ShieldCheck, ExternalLink } from 'lucide-react'

interface Props {
  variant?: 'light' | 'dark'
  compact?: boolean
}

export default function OnChainExplainer({ variant = 'light', compact = false }: Props) {
  const isDark = variant === 'dark'

  return (
    <div
      className={`flex items-start gap-2 shrink-0 ${
        compact ? 'px-2 py-1.5' : 'px-3 py-2'
      } rounded-lg border ${
        isDark
          ? 'bg-indigo-500/10 border-indigo-500/20'
          : 'bg-brand-10/40 border-brand-100/20'
      }`}
    >
      <ShieldCheck
        className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-indigo-300' : 'text-brand-100'}`}
      />
      <p
        className={`${compact ? 'text-[10px]' : 'text-[10px] md:text-xs'} leading-relaxed ${
          isDark ? 'text-white/70' : 'text-fg-subtle'
        }`}
      >
        <span className={`font-semibold ${isDark ? 'text-indigo-200' : 'text-brand-100'}`}>Tx</span>
        를 누르면{' '}
        <span className={`inline-flex items-center gap-0.5 ${isDark ? 'text-indigo-300' : 'text-brand-100'}`}>
          Arbiscan <ExternalLink className="w-3 h-3" />
        </span>{' '}
        블록체인 탐색기에서 실제 온체인 기록을 확인할 수 있습니다.
        기록은 전 세계 노드에 분산 저장되며, 한 번 기록되면{' '}
        <span className={`font-medium ${isDark ? 'text-white' : 'text-fg-base'}`}>위·변조가 불가능</span>
        합니다.
      </p>
    </div>
  )
}

export function TxLink({ txHash, variant = 'dark' }: { txHash: string; variant?: 'light' | 'dark' }) {
  return (
    <a
      href={`https://sepolia.arbiscan.io/tx/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 font-mono hover:underline ${
        variant === 'dark'
          ? 'text-violet-300 hover:text-violet-200'
          : 'text-brand-100 hover:text-brand-100/80'
      }`}
      title="블록체인 탐색기에서 온체인 기록 확인 (위·변조 불가)"
    >
      {txHash.slice(0, 8)}…
      <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
    </a>
  )
}
