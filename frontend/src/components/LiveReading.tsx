import { useEffect, useState } from 'react'
import type { EnergyReading } from '../hooks/useEnergyData'
import { Zap } from 'lucide-react'

interface Props {
  reading: EnergyReading | null
  totalReadings: number
}

export default function LiveReading({ reading, totalReadings }: Props) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (!reading) return
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 600)
    return () => clearTimeout(t)
  }, [reading?.txHash])

  if (!reading) {
    return (
      <div className="border border-border-strong rounded-lg bg-bg-base-opaque p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-fg-muted" />
          <h3 className="text-sm font-semibold text-fg-base">최근 계량</h3>
        </div>
        <p className="text-xs text-fg-muted">아직 기록된 데이터가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className={`border border-border-strong rounded-lg bg-bg-base-opaque p-4 transition-all duration-300 ${pulse ? 'ring-1 ring-brand-100/40' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-brand-100" />
        <h3 className="text-sm font-semibold text-fg-base">최근 계량</h3>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tag-cyan-100 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-tag-cyan-100" />
          </span>
          <span className="text-[10px] text-fg-muted">실시간</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric label="전력량" value={`${reading.wh} Wh`} />
        <Metric label="kWh" value={reading.kWh.toFixed(4)} />
        <Metric label="블록 번호" value={`#${reading.blockNumber.toLocaleString()}`} />
        <Metric label="총 전송" value={`${totalReadings}회`} />
      </div>

      <div className="mt-3 pt-3 border-t border-border-base">
        <span className="text-[10px] text-fg-muted font-mono">
          {new Date(reading.timestamp * 1000).toLocaleString('ko-KR')}
        </span>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-fg-muted mb-0.5">{label}</div>
      <div className="text-lg font-bold text-fg-base font-mono">{value}</div>
    </div>
  )
}
