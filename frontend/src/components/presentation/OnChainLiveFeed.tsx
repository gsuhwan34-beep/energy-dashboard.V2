import { Radio, ExternalLink } from 'lucide-react'
import type { ChainEvent } from '../../lib/presentation'
import { shortAddr } from '../../lib/presentation'

interface Props {
  events: ChainEvent[]
  latestBlock?: number
}

const TYPE_STYLE = {
  consume: { dot: 'bg-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
  produce: { dot: 'bg-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
  settle: { dot: 'bg-violet-400', badge: 'bg-violet-500/20 text-violet-300' },
}

export default function OnChainLiveFeed({ events, latestBlock }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 md:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h3 className="text-sm md:text-base font-bold text-white">온체인 라이브 피드</h3>
        </div>
        {latestBlock && (
          <span className="text-[10px] font-mono text-white/40">Block #{latestBlock.toLocaleString()}</span>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto max-h-[280px] md:max-h-none">
        {events.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-8">온체인 이벤트 대기 중…</p>
        ) : (
          events.map((ev) => {
            const style = TYPE_STYLE[ev.type]
            return (
              <div
                key={ev.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style.badge}`}>
                      {ev.label}
                    </span>
                    <span className="text-xs text-white/80 font-semibold">
                      {ev.wh != null && `${ev.wh} Wh`}
                      {ev.kWh != null && ev.type === 'settle' && `${ev.kWh.toFixed(3)} kWh`}
                      {ev.won != null && ` · ${ev.won.toFixed(2)} WON`}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    {new Date(ev.timestamp * 1000).toLocaleString('ko-KR')}
                    {ev.wallet && ` · ${shortAddr(ev.wallet)}`}
                  </p>
                </div>
                <a
                  href={`https://sepolia.arbiscan.io/tx/${ev.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
