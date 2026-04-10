import { tstampToDate, Tstamp } from '../schema/type/Tstamp'
import { startOfDay, differenceInDays, addDays as addDaysFn } from 'date-fns'

export type CareStatus = 'OVERDUE' | 'DUE_TODAY' | 'UPCOMING' | 'FUTURE'

export interface CareStatusResult {
  status: CareStatus
  color: string
}

export function getCareStatus(dueDate: Tstamp): CareStatusResult {
  const today = startOfDay(new Date())
  const due = startOfDay(tstampToDate(dueDate) ?? new Date())
  const daysUntil = differenceInDays(due, today)

  if (daysUntil < 0) return { status: 'OVERDUE', color: 'red' }
  if (daysUntil === 0) return { status: 'DUE_TODAY', color: 'amber' }
  if (daysUntil <= 7) return { status: 'UPCOMING', color: 'green' }
  return { status: 'FUTURE', color: 'gray' }
}

export function calculateNextDueDate(completedDate: Tstamp, cycleDays: number): Date {
  const completed = tstampToDate(completedDate) ?? new Date()
  return addDaysFn(completed, cycleDays)
}
