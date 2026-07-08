import type { VerifiedProducerSale } from '../../hooks/useProducerData'
import { shortAddr } from '../../lib/presentation'
import OnChainExplainer, { TxLink } from './OnChainExplainer'

interface Props {
  title: string
  sales: VerifiedProducerSale[]
}

export default function SalesTxTable({ title, sales }: Props) {
  const sorted = [...sales].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] flex flex-col h-full min-h-0 overflow-hidden">
      <div className="px-3 py-2 border-b border-white/10 shrink-0 space-y-2">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-[10px] text-white/45">
          purchaseEnergy 정산 시 MetaMask로 결제한 지갑 주소입니다.
        </p>
        <OnChainExplainer />
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {sorted.length === 0 ? (
          <p className="text-xs text-white/40 text-center py-8">판매 기록 없음</p>
        ) : (
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-slate-900/95 text-white/50">
              <tr>
                <th className="px-2 py-1.5 text-left font-medium">정산 주차</th>
                <th className="px-2 py-1.5 text-left font-medium">결제 지갑</th>
                <th className="px-2 py-1.5 text-right font-medium">kWh</th>
                <th className="px-2 py-1.5 text-right font-medium">WON</th>
                <th className="px-2 py-1.5 text-right font-medium">단가</th>
                <th className="px-2 py-1.5 text-left font-medium">Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sorted.map((s) => (
                <tr key={s.txHash} className="hover:bg-white/5">
                  <td className="px-2 py-2 text-white/80 whitespace-nowrap">{s.weekLabel}</td>
                  <td className="px-2 py-2 font-mono text-white/70">{shortAddr(s.buyerWallet ?? s.from)}</td>
                  <td className="px-2 py-2 text-right text-emerald-300 font-semibold">{s.kWh.toFixed(4)}</td>
                  <td className="px-2 py-2 text-right text-white font-semibold">{s.wonAmount.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right text-white/60">{s.ratePerKwh}</td>
                  <td className="px-2 py-2">
                    <TxLink txHash={s.txHash} />
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
