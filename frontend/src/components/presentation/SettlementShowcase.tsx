import { ArrowRight, CheckCircle2, Clock, Coins } from 'lucide-react'
import type { VerifiedProducerSale } from '../../hooks/useProducerData'
import { shortAddr } from '../../lib/presentation'

interface Props {
  sales: VerifiedProducerSale[]
  consumerKWh: number
  consumerWh: number
}

export default function SettlementShowcase({ sales, consumerKWh, consumerWh }: Props) {
  const latest = sales.length > 0 ? sales[sales.length - 1] : null

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 md:p-5 h-full">
      <h3 className="text-sm md:text-base font-bold text-white mb-4">P2P 정산 흐름</h3>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-300" />
            <span className="text-xs font-bold text-orange-200">정산 전</span>
          </div>
          <p className="text-2xl font-black text-white">{consumerKWh.toFixed(3)} <span className="text-sm font-normal text-white/50">kWh</span></p>
          <p className="text-xs text-white/50 mt-1">{consumerWh.toLocaleString()} Wh · 온체인 계량 완료</p>
          {latest && (
            <p className="text-[10px] text-white/40 mt-2">대상 주차: {latest.weekLabel}</p>
          )}
        </div>

        <div className="hidden md:flex flex-col items-center justify-center gap-1 px-1">
          <Coins className="w-6 h-6 text-violet-400" />
          <ArrowRight className="w-5 h-5 text-white/30" />
          <span className="text-[9px] text-white/40 text-center">WON<br />송금</span>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-bold text-emerald-200">정산 후 (검증됨)</span>
          </div>
          {latest ? (
            <>
              <p className="text-2xl font-black text-white">{latest.wonAmount.toFixed(2)} <span className="text-sm font-normal text-white/50">WON</span></p>
              <p className="text-xs text-white/50 mt-1">{latest.kWh.toFixed(4)} kWh · {latest.ratePerKwh} WON/kWh</p>
              <p className="text-[10px] text-white/40 mt-2 font-mono">From {shortAddr(latest.from)}</p>
              <a
                href={`https://sepolia.arbiscan.io/tx/${latest.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-[10px] text-violet-300 hover:underline"
              >
                Arbiscan에서 Tx 확인 →
              </a>
            </>
          ) : (
            <p className="text-sm text-white/40">검증된 정산 대기 중</p>
          )}
        </div>
      </div>

      {sales.length > 1 && (
        <p className="text-[10px] text-white/40 mt-3 text-center">
          총 {sales.length}건의 검증된 P2P 정산이 온체인에 기록됨
        </p>
      )}
    </div>
  )
}
