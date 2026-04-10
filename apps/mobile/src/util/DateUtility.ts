import { formatDistanceToNow, parseISO, format, isToday as isTodayFn, isPast as isPastFn, differenceInDays, addDays as addDaysFn } from 'date-fns'

export function toIsoString(date: Date): string {
  return date.toISOString()
}

export function fromIsoString(iso: string): Date {
  return parseISO(iso)
}

export function todayIso(): string {
  return toIsoString(new Date())
}

export function isToday(iso: string): boolean {
  return isTodayFn(parseISO(iso))
}

export function isPast(iso: string): boolean {
  return isPastFn(parseISO(iso))
}

export function daysBetween(startIso: string, endIso: string): number {
  return differenceInDays(parseISO(endIso), parseISO(startIso))
}

export function addDays(iso: string, days: number): string {
  return toIsoString(addDaysFn(parseISO(iso), days))
}

export function formatDate(iso: string): string {
  if (!iso) return ''
  return format(parseISO(iso), 'MMM d, yyyy')
}

export function formatRelativeTime(iso: string): string {
  if (!iso) return ''
  return formatDistanceToNow(parseISO(iso), { addSuffix: true })
}
