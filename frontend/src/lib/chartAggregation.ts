import type { EnergyReading } from '../hooks/useEnergyData'
import { getCalendarWeekDays, formatDayLabel } from './presentation'

/** 일별=전송별, 주별=7일, 월별=8주, 연별=12개월 */
export type ChartPeriodMode = 'day' | 'week' | 'month' | 'year'

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

/** 일별: 선택일의 각 계량(5분 간격 등) 개별 막대 */
export function aggregateDayTx(readings: EnergyReading[], day: Date): ChartBucket[] {
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

/** 주별: 선택 주(월~일) 7일 */
export function aggregateWeek7Days(readings: EnergyReading[], anchor: Date): ChartBucket[] {
  const weekDays = getCalendarWeekDays(getWeekMonday(anchor))
  return weekDays.map((day) => {
    const start = startOfDay(day)
    const end = new Date(start)
    end.setHours(23, 59, 59, 999)
    const bucket = sumReadingsInRange(readings, start, end)
    return { ...bucket, label: formatDayLabel(day) }
  })
}

/** 월별: 선택 주(월요일)를 끝으로 최근 8주 */
export function aggregateMonth8Weeks(readings: EnergyReading[], endMonday: Date): ChartBucket[] {
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

/** 연별: 해당 연도 12개월 */
export function aggregateYear12Months(readings: EnergyReading[], anchor: Date): ChartBucket[] {
  const y = anchor.getFullYear()
  return Array.from({ length: 12 }, (_, i) => {
    const start = new Date(y, i, 1, 0, 0, 0, 0)
    const end = new Date(y, i + 1, 0, 23, 59, 59, 999)
    const bucket = sumReadingsInRange(readings, start, end)
    return { ...bucket, label: `${i + 1}월` }
  })
}

export function getPeriodSubtitle(mode: ChartPeriodMode, anchor: Date, txCount?: number): string {
  switch (mode) {
    case 'day':
      return `${anchor.getFullYear()}년 ${anchor.getMonth() + 1}월 ${anchor.getDate()}일 · 전송 ${txCount ?? 0}건`
    case 'week': {
      const days = getCalendarWeekDays(getWeekMonday(anchor))
      return `${formatDayLabel(days[0])} ~ ${formatDayLabel(days[6])} (7일)`
    }
    case 'month':
      return `${formatDayLabel(getWeekMonday(anchor))} 기준 최근 8주`
    case 'year':
      return `${anchor.getFullYear()}년 (12개월)`
    default:
      return ''
  }
}

export function snapAnchorForMode(mode: ChartPeriodMode, date: Date): Date {
  const d = startOfDay(date)
  if (mode === 'week') return getWeekMonday(d)
  if (mode === 'month') {
    if (isFirstMondayOfMonth(d)) return d
    return getWeekMonday(new Date(d.getFullYear(), d.getMonth(), 1))
  }
  if (mode === 'year') return new Date(d.getFullYear(), 0, 1)
  return d
}

export function calendarModeForPeriod(mode: ChartPeriodMode): 'any' | 'monday' | 'firstMonday' {
  if (mode === 'week') return 'monday'
  if (mode === 'month') return 'firstMonday'
  return 'any'
}
