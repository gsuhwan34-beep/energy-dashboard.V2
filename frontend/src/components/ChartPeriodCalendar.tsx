import { useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import {
  isFirstMondayOfMonth,
  isMonday,
  type ChartPeriodMode,
  calendarModeForPeriod,
  snapAnchorForMode,
} from '@/lib/chartAggregation'
import { toDateInputValue } from '@/lib/presentation'

interface Props {
  periodMode: ChartPeriodMode
  value: Date
  onChange: (date: Date) => void
}

function formatButtonLabel(mode: ChartPeriodMode, date: Date): string {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  switch (mode) {
    case 'week':
      return `${y}.${m}.${d} (월~일)`
    case 'month':
      return `${y}년 ${m}월 (8주)`
    case 'year':
      return `${y}년`
    default:
      return `${y}.${m}.${d}`
  }
}

export default function ChartPeriodCalendar({ periodMode, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const calMode = calendarModeForPeriod(periodMode)

  const isDayDisabled = (date: Date) => {
    if (calMode === 'monday') return !isMonday(date)
    if (calMode === 'firstMonday') return !isFirstMondayOfMonth(date)
    return false
  }

  const handleSelect = (date: Date | undefined) => {
    if (!date || isDayDisabled(date)) return
    onChange(snapAnchorForMode(periodMode, date))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-xs font-medium border-border-strong bg-bg-subtle"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-fg-muted" />
          {formatButtonLabel(periodMode, value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        {calMode === 'monday' && (
          <p className="text-[10px] text-fg-muted px-3 pt-2">월요일 선택 → 해당 주 7일</p>
        )}
        {calMode === 'firstMonday' && (
          <p className="text-[10px] text-fg-muted px-3 pt-2">매월 첫 월요일 선택 → 최근 8주</p>
        )}
        {periodMode === 'year' ? (
          <div className="p-3 space-y-2">
            <p className="text-[10px] text-fg-muted">연도 선택</p>
            <input
              type="number"
              min={2020}
              max={2035}
              value={value.getFullYear()}
              onChange={(e) => {
                const y = Number(e.target.value)
                if (y >= 2020 && y <= 2035) onChange(new Date(y, 0, 1))
              }}
              className="w-full text-sm bg-bg-subtle border border-border-strong rounded px-2 py-1.5"
            />
          </div>
        ) : (
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={isDayDisabled}
            modifiers={{
              selectable: (date) => !isDayDisabled(date),
            }}
            modifiersClassNames={{
              selectable:
                '[&_button]:bg-brand-10 [&_button]:text-brand-100 [&_button]:font-semibold [&_button:not([disabled])]:hover:bg-brand-10/80',
            }}
            classNames={{
              disabled: 'opacity-30 [&_button]:text-fg-disabled [&_button]:cursor-not-allowed',
            }}
            initialFocus
          />
        )}
        {calMode === 'any' && periodMode !== 'year' && (
          <div className="px-3 pb-2 border-t border-border-base pt-2">
            <label className="flex items-center gap-2 text-[10px] text-fg-muted">
              빠른 선택
              <input
                type="date"
                value={toDateInputValue(value)}
                onChange={(e) => {
                  const [y, m, d] = e.target.value.split('-').map(Number)
                  onChange(new Date(y, m - 1, d))
                  setOpen(false)
                }}
                className="text-xs bg-bg-subtle border border-border-strong rounded px-1 py-0.5"
              />
            </label>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function PeriodTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap',
        active ? 'bg-brand-10 text-brand-100' : 'text-fg-muted hover:text-fg-subtle hover:bg-bg-subtle',
      )}
    >
      {children}
    </button>
  )
}
