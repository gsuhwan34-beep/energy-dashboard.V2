import type { EnergyReading } from '../hooks/useEnergyData'
import { getCalendarWeekDays, formatDayLabel } from './presentation'

export type ChartPeriodMode = 'day7' | 'week8' | 'month' | 'year' | 'tx'

export interface ChartBucket {
  label: string
  wh: number
  kWh: number
  count: number
}

export function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function getWeekMonday(date: Date): Date {
  const d = startOfDay(date)
  const day = d.getDay()
  const offset = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + offset)
  return d
}

export function isMonday(date: Date): boolean {
  return date.getDay() === 1
}

/** 해당 월의 첫 번째 월요일 (1~7일 사이) */
export function isFirstMondayOfMonth(date: Date): boolean {
  return date.getDay() === 1 && date.getDate() <= 7
}

export function sumReadingsInRange(readings: EnergyReading[], start: Date, end: Date): ChartBucket {
  const startMs = start.getTime()
  const endMs = end.getTime()
  const inRange = readings.filter((r) => {
    const t = r.timestamp * 1000
    return t >= startMs && t <= endMs
  })
  const wh = inRange.reduce((s, r) => s + r.wh, 0)
  return {
    label: '',
    wh: Number(wh.toFixed(4)),
    kWh: Number((wh / 1000).toFixed(6)),
    count: inRange.length,
  }
}

/** 일별 탭: 선택일이 포함된 주(월~일) 7일 */
export function aggregateDay7Week(readings: EnergyReading[], anchor: Date): ChartBucket[] {
  const weekDays = getCalendarWeekDays(anchor)
  return weekDays.map((day) => {
    const start = startOfDay(day)
    const end = new Date(start)
    end.setHours(23, 59, 59, 999)
    const bucket = sumReadingsInRange(readings, start, end)
    return { ...bucket, label: formatDayLabel(day) }
  })
}

/** 주별 탭: 선택 주(월요일)를 끝으로 최근 8주 */
export function aggregateWeek8(readings: EnergyReading[], endMonday: Date): ChartBucket[] {
  const monday = getWeekMonday(endMonday)
  const buckets: ChartBucket[] = []

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(monday)
    weekStart.setDate(monday.getDate() - i * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const bucket = sumReadingsInRange(readings, weekStart, weekEnd)
    const end = new Date(weekStart)
    end.setDate(weekStart.getDate() + 6)
    buckets.push({
      ...bucket,
      label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}~${end.getMonth() + 1}/${end.getDate()}`,
    })
  }
  return buckets
}

/** 월별 탭: 해당 월의 일별 합계 */
export function aggregateMonthDaily(readings: EnergyReading[], firstMondayAnchor: Date): ChartBucket[] {
  const y = firstMondayAnchor.getFullYear()
  const m = firstMondayAnchor.getMonth()
  const lastDay = new Date(y, m + 1, 0).getDate()
  const buckets: ChartBucket[] = []

  for (let day = 1; day <= lastDay; day++) {
    const start = new Date(y, m, day, 0, 0, 0, 0)
    const end = new Date(y, m, day, 23, 59, 59, 999)
    const bucket = sumReadingsInRange(readings, start, end)
    buckets.push({ ...bucket, label: `${day}일` })
  }
  return buckets
}

/** 연별 탭: 해당 연도 12개월 */
export function aggregateYear12(readings: EnergyReading[], anchor: Date): ChartBucket[] {
  const y = anchor.getFullYear()
  return Array.from({ length: 12 }, (_, i) => {
    const start = new Date(y, i, 1, 0, 0, 0, 0)
    const end = new Date(y, i + 1, 0, 23, 59, 59, 999)
    const bucket = sumReadingsInRange(readings, start, end)
    return { ...bucket, label: `${i + 1}월` }
  })
}

/** 전송별 탭: 선택일의 각 계량(5분 간격 등) 개별 막대 */
export function aggregateTxPerReading(readings: EnergyReading[], day: Date): ChartBucket[] {
  const start = startOfDay(day)
  const end = new Date(start)
  end.setHours(23, 59, 59, 999)

  return readings
    .filter((r) => {
      const t = r.timestamp * 1000
      return t >= start.getTime() && t <= end.getTime()
    })
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((r) => {
      const d = new Date(r.timestamp * 1000)
      return {
        label: d.toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        wh: r.wh,
        kWh: r.kWh,
        count: 1,
      }
    })
}

export function getPeriodSubtitle(mode: ChartPeriodMode, anchor: Date): string {
  switch (mode) {
    case 'day7': {
      const days = getCalendarWeekDays(anchor)
      return `${formatDayLabel(days[0])} ~ ${formatDayLabel(days[6])} (7일)`
    }
    case 'week8':
      return `${formatDayLabel(getWeekMonday(anchor))} 기준 최근 8주`
    case 'month':
      return `${anchor.getFullYear()}년 ${anchor.getMonth() + 1}월 (일별)`
    case 'year':
      return `${anchor.getFullYear()}년 (월별)`
    case 'tx':
      return `${anchor.getFullYear()}년 ${anchor.getMonth() + 1}월 ${anchor.getDate()}일`
    default:
      return ''
  }
}

export function snapAnchorForMode(mode: ChartPeriodMode, date: Date): Date {
  const d = startOfDay(date)
  if (mode === 'week8') return getWeekMonday(d)
  if (mode === 'month') {
    if (isFirstMondayOfMonth(d)) return d
    return getWeekMonday(new Date(d.getFullYear(), d.getMonth(), 1))
  }
  return d
}

export function calendarModeForPeriod(mode: ChartPeriodMode): 'any' | 'monday' | 'firstMonday' {
  if (mode === 'week8') return 'monday'
  if (mode === 'month') return 'firstMonday'
  return 'any'
}
