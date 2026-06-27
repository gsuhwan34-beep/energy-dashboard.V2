import type { EnergyReading } from '../../hooks/useEnergyData'
import OnChainExplainer, { TxLink } from './OnChainExplainer'

interface Props {
  title: string
  readings: EnergyReading[]
  emptyText?: string
}

export default function MeterTxTable({ title, readings, emptyText = '기록 없음' }: Props) {
  const sorted = [...readings].sort((a, b) => b.timestamp - a.timestamp).slice(0, 25)

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] flex flex-col h-full min-h-0 overflow-hidden">
      <div className="px-3 py-2 border-b border-white/10 shrink-0 space-y-2">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <OnChainExplainer />
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {sorted.length === 0 ? (
          <p className="text-xs text-white/40 text-center py-8">{emptyText}</p>
        ) : (
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-slate-900/95 text-white/50">
              <tr>
                <th className="px-2 py-1.5 text-left font-medium">시각</th>
                <th className="px-2 py-1.5 text-right font-medium">Wh</th>
                <th className="px-2 py-1.5 text-left font-medium">온체인 Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sorted.map((r) => (
                <tr key={`${r.txHash}-${r.logIndex}`} className="hover:bg-white/5">
                  <td className="px-2 py-1.5 text-white/70 whitespace-nowrap">
                    {new Date(r.timestamp * 1000).toLocaleString('ko-KR', {
                      month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-2 py-1.5 text-right font-semibold text-emerald-300">{r.wh}</td>
                  <td className="px-2 py-1.5">
                    <TxLink txHash={r.txHash} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
