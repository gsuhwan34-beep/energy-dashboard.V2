import type { SettlementTransfer } from '../hooks/useEnergyData'

interface Props {
  sales: SettlementTransfer[]
  ratePerKwh: number
}

export default function ProducerSalesTable({ sales, ratePerKwh }: Props) {
  if (!sales.length) {
    return (
      <div className="border border-border-strong rounded-lg bg-bg-base-opaque px-4 py-8 text-center text-xs text-fg-muted">
        아직 판매(정산) 내역이 없습니다.
      </div>
    )
  }

  const sorted = [...sales].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="border border-border-strong rounded-lg bg-bg-base-opaque overflow-hidden">
      <div className="px-4 py-3 border-b border-border-base">
        <h3 className="text-sm font-semibold text-fg-base">판매 내역 (WON 수신)</h3>
        <p className="text-[10px] text-fg-muted mt-0.5">단가 {ratePerKwh} WON/kWh 기준 역산</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-base bg-bg-subtle/50 text-fg-muted text-left">
              <th className="px-4 py-2 font-medium">일시</th>
              <th className="px-4 py-2 font-medium">구매자</th>
              <th className="px-4 py-2 font-medium text-right">수신 WON</th>
              <th className="px-4 py-2 font-medium text-right">≈ kWh</th>
              <th className="px-4 py-2 font-medium">Tx</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-base">
            {sorted.map((sale) => {
              const estKwh = ratePerKwh > 0 ? sale.wonAmount / ratePerKwh : 0
              return (
                <tr key={sale.txHash} className="hover:bg-bg-subtle/30">
                  <td className="px-4 py-2.5 text-fg-subtle whitespace-nowrap">
                    {new Date(sale.timestamp * 1000).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-fg-base">
                    {shortAddr(sale.from)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-fg-base">
                    {sale.wonAmount.toLocaleString('ko-KR', { maximumFractionDigits: 4 })}
                  </td>
                  <td className="px-4 py-2.5 text-right text-brand-100 font-medium">
                    {estKwh.toFixed(4)}
                  </td>
                  <td className="px-4 py-2.5">
                    <a
                      href={`https://sepolia.arbiscan.io/tx/${sale.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-100 hover:underline"
                    >
                      보기
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
