interface Props {
  totalKWh: number
  soldKWh: number
  availableKWh: number
  totalWon: number
}

export default function ProducerInventoryGauge({ totalKWh, soldKWh, availableKWh, totalWon }: Props) {
  const soldPct = totalKWh > 0 ? Math.min(100, (soldKWh / totalKWh) * 100) : 0
  const availPct = totalKWh > 0 ? Math.min(100 - soldPct, (availableKWh / totalKWh) * 100) : 0

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 md:p-5 h-full flex flex-col">
      <h3 className="text-sm md:text-base font-bold text-white mb-4">생산 · 판매 재고</h3>

      <div className="flex-1 flex flex-col justify-center gap-6">
        <div className="relative w-40 h-40 mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke="url(#soldGrad)" strokeWidth="12"
              strokeDasharray={`${soldPct * 2.64} 264`}
              strokeLinecap="round"
            />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke="url(#availGrad)" strokeWidth="12"
              strokeDasharray={`${availPct * 2.64} 264`}
              strokeDashoffset={`-${soldPct * 2.64}`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="soldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="availGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{totalKWh.toFixed(1)}</span>
            <span className="text-[10px] text-white/50">kWh 생산</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/20">
            <p className="text-lg font-bold text-violet-300">{soldKWh.toFixed(2)}</p>
            <p className="text-[9px] text-white/50">판매됨 kWh</p>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20">
            <p className="text-lg font-bold text-emerald-300">{availableKWh.toFixed(2)}</p>
            <p className="text-[9px] text-white/50">잔여 kWh</p>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/20">
            <p className="text-lg font-bold text-amber-300">{totalWon.toFixed(0)}</p>
            <p className="text-[9px] text-white/50">WON 수익</p>
          </div>
        </div>
      </div>
    </div>
  )
}
