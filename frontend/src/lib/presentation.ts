import type { EnergyReading } from '../hooks/useEnergyData'
import type { VerifiedProducerSale } from '../hooks/useProducerData'

export const DEMO_CONSUMER_WALLET = '0x6220F267AEDfB782d8aDD9D13AAB3f5B51c0b3c5'
export const DEMO_PRODUCER_WALLET = '0xf7486A72851c1054661e9E6bF96f1ACcb1f7b6F8'

export interface HourCell {
  key: string
  hour: number
  dayLabel: string
  wh: number
  count: number
  timestamp: number
}

export function buildHourlyHeatmap(readings: EnergyReading[], days = 7): HourCell[][] {
  const now = new Date()
  const rows: HourCell[][] = []

  for (let d = days - 1; d >= 0; d--) {
    const day = new Date(now)
    day.setHours(0, 0, 0, 0)
    day.setDate(day.getDate() - d)
    const dayLabel = day.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })
    const row: HourCell[] = []

    for (let h = 0; h < 24; h++) {
      const start = new Date(day)
      start.setHours(h, 0, 0, 0)
      const end = new Date(day)
      end.setHours(h + 1, 0, 0, 0)

      const inHour = readings.filter((r) => {
        const t = r.timestamp * 1000
        return t >= start.getTime() && t < end.getTime()
      })

      row.push({
        key: `${day.toISOString().slice(0, 10)}-${h}`,
        hour: h,
        dayLabel,
        wh: inHour.reduce((s, r) => s + r.wh, 0),
        count: inHour.length,
        timestamp: Math.floor(start.getTime() / 1000),
      })
    }
    rows.push(row)
  }
  return rows
}

export function heatmapColor(wh: number, maxWh: number): string {
  if (wh <= 0) return 'rgba(255,255,255,0.06)'
  const t = Math.min(1, wh / Math.max(maxWh, 1))
  if (t < 0.25) return `rgba(52, 211, 153, ${0.25 + t})`
  if (t < 0.5) return `rgba(34, 197, 94, ${0.4 + t * 0.5})`
  if (t < 0.75) return `rgba(251, 191, 36, ${0.5 + t * 0.4})`
  return `rgba(239, 68, 68, ${0.65 + t * 0.35})`
}

export interface ChainEvent {
  id: string
  type: 'consume' | 'produce' | 'settle'
  label: string
  wh?: number
  kWh?: number
  won?: number
  txHash: string
  timestamp: number
  wallet: string
}

export function buildChainEvents(
  consumerReadings: EnergyReading[],
  producerReadings: EnergyReading[],
  sales: VerifiedProducerSale[],
): ChainEvent[] {
  const events: ChainEvent[] = []

  for (const r of consumerReadings.slice(-20)) {
    events.push({
      id: `c-${r.txHash}-${r.logIndex}`,
      type: 'consume',
      label: '소비 계량',
      wh: r.wh,
      kWh: r.kWh,
      txHash: r.txHash,
      timestamp: r.timestamp,
      wallet: '',
    })
  }

  for (const r of producerReadings.slice(-20)) {
    events.push({
      id: `p-${r.txHash}-${r.logIndex}`,
      type: 'produce',
      label: '생산 계량',
      wh: r.wh,
      kWh: r.kWh,
      txHash: r.txHash,
      timestamp: r.timestamp,
      wallet: '',
    })
  }

  for (const s of sales) {
    events.push({
      id: `s-${s.txHash}`,
      type: 'settle',
      label: 'P2P 정산',
      kWh: s.kWh,
      won: s.wonAmount,
      txHash: s.txHash,
      timestamp: s.timestamp,
      wallet: s.from,
    })
  }

  return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 12)
}

export function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr || '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}
