import { Cpu, Link2, Coins, ChevronRight } from 'lucide-react'

const STEPS = [
  { icon: Cpu, title: '하드웨어 계량', sub: 'IoT 미터 · Wh/kWh 측정' },
  { icon: Link2, title: '온체인 기록', sub: 'Arbitrum Sepolia · 스마트 컨트랙트' },
  { icon: Coins, title: 'WON P2P 정산', sub: '주차별 토큰 결제 · 교차 검증' },
]

export default function SystemFlowBanner() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-2">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
              <step.icon className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm md:text-base font-bold text-white truncate">{step.title}</p>
              <p className="text-[10px] md:text-xs text-white/60 truncate">{step.sub}</p>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="hidden md:block w-5 h-5 text-white/30 shrink-0 mx-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
