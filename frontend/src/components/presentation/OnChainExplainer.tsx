import { ShieldCheck, ExternalLink } from 'lucide-react'

export default function OnChainExplainer() {
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 shrink-0">
      <ShieldCheck className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
      <p className="text-[10px] md:text-xs text-white/70 leading-relaxed">
        <span className="text-indigo-200 font-semibold">Tx</span>를 누르면{' '}
        <span className="inline-flex items-center gap-0.5 text-indigo-300">
          Arbiscan <ExternalLink className="w-3 h-3" />
        </span>{' '}
        블록체인 탐색기에서 실제 온체인 기록을 확인할 수 있습니다.
        기록은 전 세계 노드에 분산 저장되며, 한 번 기록되면{' '}
        <span className="text-white font-medium">위·변조가 불가능</span>합니다.
      </p>
    </div>
  )
}

export function TxLink({ txHash }: { txHash: string }) {
  return (
    <a
      href={`https://sepolia.arbiscan.io/tx/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-mono text-violet-300 hover:text-violet-200 hover:underline"
      title="블록체인 탐색기에서 온체인 기록 확인 (위·변조 불가)"
    >
      {txHash.slice(0, 8)}…
      <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
    </a>
  )
}
