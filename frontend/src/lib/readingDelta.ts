import type { EnergyReading } from '../hooks/useEnergyData'

/** 온체인 전송 순서 (block → logIndex) */
export function sortReadings(readings: EnergyReading[]): EnergyReading[] {
  return [...readings].sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) return a.blockNumber - b.blockNumber
    return a.logIndex - b.logIndex
  })
}

/** 전송값 Wh 합산 — 차분/누적 변환 없음 */
export function getTotalWh(readings: EnergyReading[]): number {
  if (!readings.length) return 0
  return Number(sortReadings(readings).reduce((sum, r) => sum + r.wh, 0).toFixed(4))
}

/** 마지막 전송 1건 */
export function getLatestReading(readings: EnergyReading[]): EnergyReading | null {
  const sorted = sortReadings(readings)
  return sorted.length ? sorted[sorted.length - 1] : null
}

/** @deprecated sortReadings 사용 — 차분 변환 없음 */
export function toDeltaReadings(readings: EnergyReading[]): EnergyReading[] {
  return sortReadings(readings)
}

/** @deprecated getTotalWh 사용 */
export function getCumulativeWh(readings: EnergyReading[]): number {
  return getTotalWh(readings)
}

/** @deprecated getLatestReading 사용 */
export function getLatestDeltaReading(readings: EnergyReading[]): EnergyReading | null {
  return getLatestReading(readings)
}
