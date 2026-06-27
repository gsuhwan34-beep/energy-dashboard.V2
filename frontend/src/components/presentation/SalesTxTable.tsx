import type { VerifiedProducerSale } from '../../hooks/useProducerData'
import { shortAddr } from '../../lib/presentation'

interface Props {
  title: string
  sales: VerifiedProducerSale[]
}

export default function SalesTxTable({ title, sales }: Props) {
  const sorted = [...sales].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] flex flex-col h-full min-h-0 overflow-hidden">
      <div className="px-3 py-2 border-b border-white/10 shrink-0">
        <h4 className="text-sm font-bold text-white">{title}</h4>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {sorted.length === 0 ? (
          <p className="text-xs text-white/40 text-center py-8">판매 기록 없음</p>
        ) : (
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-slate-900/95 text-white/50">
              <tr>
                <th className="px-2 py-1.5 text-left font-medium">시각</th>
                <th className="px-2 py-1.5 text-left font-medium">구매자</th>
                <th className="px-2 py-1.5 text-right font-medium">kWh</th>
                <th className="px-2 py-1.5 text-right font-medium">WON</th>
                <th className="px-2 py-1.5 text-right font-medium">단가</th>
                <th className="px-2 py-1.5 text-left font-medium">Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sorted.map((s) => (
                <tr key={s.txHash} className="hover:bg-white/5">
                  <td className="px-2 py-1.5 text-white/70 whitespace-nowrap">
                    {new Date(s.timestamp * 1000).toLocaleString('ko-KR', {
                      month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-white/80">{shortAddr(s.from)}</td>
                  <td className="px-2 py-1.5 text-right text-emerald-300 font-semibold">{s.kWh.toFixed(4)}</td>
                  <td className="px-2 py-1.5 text-right text-white font-semibold">{s.wonAmount.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-right text-white/60">{s.ratePerKwh}</td>
                  <td className="px-2 py-1.5">
                    <a
                      href={`https://sepolia.arbiscan.io/tx/${s.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-violet-300 hover:underline"
                    >
                      {shortAddr(s.txHash)}
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
