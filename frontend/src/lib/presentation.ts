import type { EnergyReading } from '../hooks/useEnergyData'
import type { VerifiedProducerSale } from '../hooks/useProducerData'

export { getCalendarWeekDays, formatDayLabel } from './settlementMatch'

export const STORAGE_CONSUMER_WALLET = 'emeter:consumer-wallet'
export const STORAGE_PRODUCER_WALLET = 'emeter:producer-wallet'
export const STORAGE_PAYER_WALLET = 'emeter:payer-wallet'
export const STORAGE_SUPPLIER_RATE = 'emeter:supplier-rate'

export const DEMO_CONSUMER_WALLET = '0x6220F267AEDfB782d8aDD9D13AAB3f5B51c0b3c5'
export const DEFAULT_PRODUCER_WALLET = '0xf0ec049222DF1CC4547a3BAA403DE80597DebB8D'

export interface HourCell {
  hour: number
  wh: number
  count: number
}

export function readStoredWallet(key: string, fallback = ''): string {
  try {
    return localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

export function writeStoredWallet(key: string, wallet: string) {
  try {
    if (/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      localStorage.setItem(key, wallet)
    }
  } catch {
    // ignore
  }
}

export function readStoredSupplierRate(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_SUPPLIER_RATE)
    if (!raw) return []
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? [n] : []
  } catch {
    return []
  }
}

/** 계량기 지갑 + MetaMask + 저장된 결제 지갑을 모두 정산 조회/매칭에 사용 */
export function resolvePayerWallets(meterWallet: string, connectedWallet?: string | null): string[] {
  const seen = new Set<string>()
  const out: string[] = []

  for (const w of [meterWallet, connectedWallet, readStoredWallet(STORAGE_PAYER_WALLET, '')]) {
    if (!w || !/^0x[a-fA-F0-9]{40}$/.test(w)) continue
    const key = w.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(w)
  }
  return out
}

export function buildDailyHeatmap(readings: EnergyReading[], date: Date): HourCell[] {
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const cells: HourCell[] = []

  for (let h = 0; h < 24; h++) {
    const start = new Date(dayStart)
    start.setHours(h, 0, 0, 0)
    const end = new Date(dayStart)
    end.setHours(h + 1, 0, 0, 0)

    const inHour = readings.filter((r) => {
      const t = r.timestamp * 1000
      return t >= start.getTime() && t < end.getTime()
    })

    cells.push({
      hour: h,
      wh: inHour.reduce((s, r) => s + r.wh, 0),
      count: inHour.length,
    })
  }
  return cells
}

export function heatmapColor(wh: number, maxWh: number): string {
  if (wh <= 0) return 'rgba(148,163,184,0.12)'
  const t = Math.min(1, wh / Math.max(maxWh, 1))
  if (t < 0.25) return `rgba(52, 211, 153, ${0.35 + t * 0.5})`
  if (t < 0.5) return `rgba(34, 197, 94, ${0.45 + t * 0.45})`
  if (t < 0.75) return `rgba(251, 191, 36, ${0.55 + t * 0.35})`
  return `rgba(239, 68, 68, ${0.7 + t * 0.3})`
}

export function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr || '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function toDateInputValue(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export type { VerifiedProducerSale }
