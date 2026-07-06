import type { EnergyReading } from '../hooks/useEnergyData'

export function sortReadings(readings: EnergyReading[]): EnergyReading[] {
  return [...readings].sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) return a.blockNumber - b.blockNumber
    return a.logIndex - b.logIndex
  })
}

/** 연속 계량값이 대부분 증가하면 누적(적산) 계량기로 판단 */
export function isLikelyCumulative(readings: EnergyReading[]): boolean {
  const sorted = sortReadings(readings)
  if (sorted.length < 2) return false
  let nonDecreasing = 0
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].wh >= sorted[i - 1].wh) nonDecreasing++
  }
  return nonDecreasing / (sorted.length - 1) >= 0.7
}

/**
 * 누적 계량기 → 5분(전송) 간 차분 Wh.
 * 이미 차분값이면 그대로 유지.
 * @param forceCumulative 생산자 등 온체인 값이 항상 누적일 때 true
 */
export function toDeltaReadings(
  readings: EnergyReading[],
  forceCumulative = false,
): EnergyReading[] {
  const sorted = sortReadings(readings)
  if (!sorted.length) return []

  const cumulative = forceCumulative || isLikelyCumulative(sorted)

  return sorted.map((r, i) => {
    let deltaWh = r.wh
    if (cumulative && i > 0) {
      const prev = sorted[i - 1].wh
      deltaWh = r.wh >= prev ? r.wh - prev : r.wh
    }
    deltaWh = Math.max(0, deltaWh)
    return {
      ...r,
      wh: Number(deltaWh.toFixed(4)),
      kWh: Number((deltaWh / 1000).toFixed(6)),
    }
  })
}

/** 생산자: 온체인 powerValue는 항상 누적 적산 */
export function toProducerDeltaReadings(readings: EnergyReading[]): EnergyReading[] {
  return toDeltaReadings(readings, true)
}

/** 생산자 총 누적 Wh — 마지막 온체인 적산값 */
export function getProducerCumulativeWh(readings: EnergyReading[]): number {
  if (!readings.length) return 0
  const sorted = sortReadings(readings)
  return Number(sorted[sorted.length - 1].wh.toFixed(4))
}

/** 전체 누적 Wh (누적 계량기: 마지막 값, 차분: 합계) */
export function getCumulativeWh(readings: EnergyReading[]): number {
  if (!readings.length) return 0
  const sorted = sortReadings(readings)
  if (isLikelyCumulative(sorted)) {
    return Number(sorted[sorted.length - 1].wh.toFixed(4))
  }
  return Number(toDeltaReadings(readings).reduce((s, r) => s + r.wh, 0).toFixed(4))
}

export function getLatestDeltaReading(readings: EnergyReading[]): EnergyReading | null {
  const deltas = toDeltaReadings(readings)
  return deltas.length ? deltas[deltas.length - 1] : null
}
