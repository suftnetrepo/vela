import {
  format,
  parseISO,
  isToday,
  isYesterday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addDays,
  subDays,
  differenceInDays,
  isSameDay,
  isSameMonth,
} from 'date-fns'

export const toDateStr   = (d: Date)   => format(d, 'yyyy-MM-dd')
export const fromDateStr = (s: string) => parseISO(s)
export const nowISO      = ()          => new Date().toISOString()
export const todayStr    = ()          => format(new Date(), 'yyyy-MM-dd')

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d))     return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMMM d')
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy')
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d')
}

// Returns calendar grid for a month — always 6 rows of 7 days
// firstDayOfWeek: 0 = Sunday, 1 = Monday
export function buildMonthGrid(date: Date, firstDayOfWeek: 0 | 1 = 1): (Date | null)[][] {
  const start    = startOfMonth(date)
  const end      = endOfMonth(date)
  const days     = eachDayOfInterval({ start, end })

  let startDow = getDay(start) // 0=Sun … 6=Sat
  if (firstDayOfWeek === 1) startDow = (startDow + 6) % 7 // shift to Mon=0

  const cells: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...days,
  ]

  // Pad to complete 6 rows
  while (cells.length < 42) cells.push(null)

  const grid: (Date | null)[][] = []
  for (let i = 0; i < 6; i++) {
    grid.push(cells.slice(i * 7, (i + 1) * 7))
  }
  return grid
}

export function daysUntilText(days: number): string {
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return '1 day ago'
  if (days < 0) return `${Math.abs(days)} days ago`
  return `In ${days} days`
}

export {
  addDays, subDays, differenceInDays, isSameDay, isSameMonth,
  startOfMonth, endOfMonth, parseISO, format, isToday,
}
