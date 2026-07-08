import type { VerifiedWeeklySettlement } from '../../lib/settlementMatch'
import { shortAddr } from '../../lib/presentation'
import OnChainExplainer, { TxLink } from './OnChainExplainer'

interface Props {
  title: string
  rows: VerifiedWeeklySettlement[]
  emptyText?: string
}

export default function SettlementTxTable({ title, rows, emptyText = '검증된 주차별 정산이 없습니다' }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] flex flex-col h-full min-h-0 overflow-hidden">
      <div className="px-3 py-2 border-b border-white/10 shrink-0 space-y-2">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-[10px] text-white/45">
          이 웹사이트에서 주차별로 정산한 내역만 표시합니다 (계량 kWh + WON 송금 교차 검증).
        </p>
        <OnChainExplainer />
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {rows.length === 0 ? (
          <p className="text-xs text-white/40 text-center py-8">{emptyText}</p>
        ) : (
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-slate-900/95 text-white/50">
              <tr>
                <th className="px-2 py-1.5 text-left font-medium">정산 주차</th>
                <th className="px-2 py-1.5 text-right font-medium">kWh</th>
                <th className="px-2 py-1.5 text-right font-medium">WON</th>
                <th className="px-2 py-1.5 text-right font-medium">단가</th>
                <th className="px-2 py-1.5 text-left font-medium">결제 지갑</th>
                <th className="px-2 py-1.5 text-left font-medium">공급자</th>
                <th className="px-2 py-1.5 text-left font-medium">Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <tr key={r.txHash} className="hover:bg-white/5">
                  <td className="px-2 py-2 text-white font-medium whitespace-nowrap">
                    {r.weekLabel}
                    <span className="block text-[9px] text-white/40 font-normal">
                      {new Date(r.timestamp * 1000).toLocaleString('ko-KR')}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right text-emerald-300 font-semibold">
                    {r.kWh.toFixed(4)}
                  </td>
                  <td className="px-2 py-2 text-right text-white font-semibold">
                    {r.wonAmount.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-right text-white/60">
                    {r.ratePerKwh} WON/kWh
                  </td>
                  <td className="px-2 py-2 font-mono text-white/70">
                    {r.buyerWallet ? shortAddr(r.buyerWallet) : '—'}
                  </td>
                  <td className="px-2 py-2 font-mono text-white/70">
                    {shortAddr(r.supplierWallet)}
                  </td>
                  <td className="px-2 py-2">
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
