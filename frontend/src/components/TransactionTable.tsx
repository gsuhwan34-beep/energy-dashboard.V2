import { useState, useMemo } from 'react'
import type { EnergyReading } from '../hooks/useEnergyData'
import { ExternalLink, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  readings: EnergyReading[]
}

const EXPLORER = 'https://sepolia.arbiscan.io/tx/'
const PAGE_SIZE = 10

export default function TransactionTable({ readings }: Props) {
  const [page, setPage] = useState(0)

  // 최신순 정렬
  const sorted = useMemo(() => [...readings].reverse(), [readings])
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageItems = sorted.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  if (!readings.length) {
    return (
      <div className="border border-border-strong rounded-lg bg-bg-base-opaque p-4">
        <h3 className="text-sm font-semibold text-fg-base mb-3">전송 기록</h3>
        <p className="text-xs text-fg-muted py-6 text-center">전송 기록이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="border border-border-strong rounded-lg bg-bg-base-opaque p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-fg-base">전송 기록</h3>
        <span className="text-[10px] text-fg-muted">{readings.length}건</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-base text-fg-muted">
              <th className="text-left py-2 pr-3 font-medium">트랜잭션</th>
              <th className="text-left py-2 pr-3 font-medium">시간</th>
              <th className="text-right py-2 pr-3 font-medium">전력량 (Wh)</th>
              <th className="text-right py-2 pr-3 font-medium">블록</th>
              <th className="text-center py-2 font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(tx => (
              <tr key={`${tx.txHash}-${tx.logIndex}`} className="border-b border-border-base hover:bg-bg-subtle/50 transition-colors">
                <td className="py-2.5 pr-3">
                  <a
                    href={`${EXPLORER}${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-brand-100 hover:underline inline-flex items-center gap-1"
                  >
                    {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="py-2.5 pr-3 text-fg-subtle whitespace-nowrap">
                  {new Date(tx.timestamp * 1000).toLocaleString('ko-KR')}
                </td>
                <td className="py-2.5 pr-3 text-right font-mono text-fg-base font-semibold">
                  {tx.wh}
                </td>
                <td className="py-2.5 pr-3 text-right font-mono text-fg-subtle">
                  {tx.blockNumber.toLocaleString()}
                </td>
                <td className="py-2.5 text-center">
                  {tx.status === 'confirmed' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-tag-cyan-10 text-tag-cyan-100">
                      <CheckCircle2 className="w-3 h-3" />
                      확인됨
                    </span>
                  ) : tx.status === 'failed' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-tag-orange-10 text-tag-orange-100">
                      <XCircle className="w-3 h-3" />
                      실패
                    </span>
                  ) : (
                    <span className="text-fg-muted text-[10px]">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-border-base">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="p-1.5 rounded hover:bg-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-fg-subtle" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                i === currentPage
                  ? 'bg-brand-100 text-white'
                  : 'text-fg-subtle hover:bg-bg-subtle'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="p-1.5 rounded hover:bg-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-fg-subtle" />
          </button>
        </div>
      )}
    </div>
  )
}
