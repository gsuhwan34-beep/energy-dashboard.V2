import type { VerifiedProducerSale } from '../hooks/useProducerData'
import OnChainExplainer from './OnChainExplainer'
import InfoTooltip, { BLOCKCHAIN_TIPS } from './InfoTooltip'

interface Props {
  sales: VerifiedProducerSale[]
  verifiedCount: number
  rawInboundCount: number
}

export default function ProducerSalesTable({ sales, verifiedCount, rawInboundCount }: Props) {
  if (!sales.length) {
    return (
      <div className="border border-border-strong rounded-lg bg-bg-base-opaque px-4 py-8 text-center text-xs text-fg-muted">
        <p>온체인 판매 내역이 없습니다.</p>
      </div>
    )
  }

  const sorted = [...sales].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="border border-border-strong rounded-lg bg-bg-base-opaque overflow-hidden">
      <div className="px-4 py-3 border-b border-border-base space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-fg-base">온체인 P2P 판매 내역</h3>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-tag-cyan-10 text-tag-cyan-100">
            원장 EnergySold
          </span>
        </div>
        <p className="text-[10px] text-fg-muted">
          원장 컨트랙트 EnergySold · {verifiedCount}건 · purchaseEnergy 정산
        </p>
        <OnChainExplainer variant="light" compact />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-base bg-bg-subtle/50 text-fg-muted text-left">
              <th className="px-4 py-2 font-medium">정산 주차</th>
              <th className="px-4 py-2 font-medium">일시</th>
              <th className="px-4 py-2 font-medium">
                <InfoTooltip label="결제 지갑" tip={BLOCKCHAIN_TIPS.paymentWallet} />
              </th>
              <th className="px-4 py-2 font-medium text-right">
                <InfoTooltip label="계량 kWh" tip={BLOCKCHAIN_TIPS.kwh} />
              </th>
              <th className="px-4 py-2 font-medium text-right">
                <InfoTooltip label="정산 WON" tip={BLOCKCHAIN_TIPS.won} />
              </th>
              <th className="px-4 py-2 font-medium text-right">단가</th>
              <th className="px-4 py-2 font-medium">
                <InfoTooltip label="Tx" tip={BLOCKCHAIN_TIPS.tx} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-base">
            {sorted.map((sale) => (
              <tr key={sale.txHash} className="hover:bg-bg-subtle/30">
                <td className="px-4 py-2.5 text-fg-base font-medium whitespace-nowrap">
                  {sale.weekLabel}
                  <span className="block text-[9px] text-fg-muted font-normal">{sale.meterReadingCount}회 계량</span>
                </td>
                <td className="px-4 py-2.5 text-fg-subtle whitespace-nowrap">
                  {new Date(sale.timestamp * 1000).toLocaleString('ko-KR')}
                </td>
                <td className="px-4 py-2.5 font-mono text-fg-base">
                  {shortAddr(sale.buyerWallet ?? sale.from)}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-brand-100">
                  {sale.kWh.toFixed(4)}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-fg-base">
                  {sale.wonAmount.toLocaleString('ko-KR', { maximumFractionDigits: 4 })}
                </td>
                <td className="px-4 py-2.5 text-right text-fg-subtle">
                  {sale.ratePerKwh} WON/kWh
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
            ))}
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
