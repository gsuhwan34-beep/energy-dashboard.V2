import type { EnrichedSettlement } from '../../lib/presentation'
import { shortAddr } from '../../lib/presentation'

interface Props {
  title: string
  rows: EnrichedSettlement[]
  emptyText?: string
}

export default function SettlementTxTable({ title, rows, emptyText = '정산 기록 없음' }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] flex flex-col h-full min-h-0 overflow-hidden">
      <div className="px-3 py-2 border-b border-white/10 shrink-0">
        <h4 className="text-sm font-bold text-white">{title}</h4>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {rows.length === 0 ? (
          <p className="text-xs text-white/40 text-center py-8">{emptyText}</p>
        ) : (
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-slate-900/95 text-white/50">
              <tr>
                <th className="px-2 py-1.5 text-left font-medium">시각</th>
                <th className="px-2 py-1.5 text-right font-medium">kWh</th>
                <th className="px-2 py-1.5 text-right font-medium">WON</th>
                <th className="px-2 py-1.5 text-right font-medium">단가</th>
                <th className="px-2 py-1.5 text-left font-medium">Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <tr key={r.txHash} className="hover:bg-white/5">
                  <td className="px-2 py-1.5 text-white/70 whitespace-nowrap">
                    {new Date(r.timestamp * 1000).toLocaleString('ko-KR', {
                      month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-2 py-1.5 text-right text-emerald-300 font-semibold">
                    {r.kWh != null ? r.kWh.toFixed(4) : '—'}
                  </td>
                  <td className="px-2 py-1.5 text-right text-white font-semibold">
                    {r.wonAmount.toFixed(2)}
                  </td>
                  <td className="px-2 py-1.5 text-right text-white/60">
                    {r.ratePerKwh != null ? `${r.ratePerKwh}` : '—'}
                  </td>
                  <td className="px-2 py-1.5">
                    <a
                      href={`https://sepolia.arbiscan.io/tx/${r.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-violet-300 hover:underline"
                    >
                      {shortAddr(r.txHash)}
                    </a>
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
