import { parseISO, isSameDay, isAfter, subDays } from 'date-fns'
import ProductionLog from '../schema/production/ProductionLog'
import { fromIsoString } from './DateUtility'

export interface ProductionSummary {
  daily: number
  weekly: number
  monthly: number
  unit: string
}

export function aggregateProduction(
  logs: ProductionLog[],
  referenceDate: string
): ProductionSummary {
  const today = fromIsoString(referenceDate)
  const weekAgo = subDays(today, 7)
  const monthAgo = subDays(today, 30)

  let daily = 0, weekly = 0, monthly = 0
  const unit = logs.length > 0 ? logs[0].unit : ''

  for (const log of logs) {
    const logDate = parseISO(log.date)
    if (isSameDay(logDate, today)) daily += log.quantity
    if (isAfter(logDate, weekAgo)) weekly += log.quantity
    if (isAfter(logDate, monthAgo)) monthly += log.quantity
  }

  return { daily, weekly, monthly, unit }
}

export function getDefaultUnit(productionType: string): string {
  switch (productionType) {
    case 'eggs': return 'count'
    case 'milk': return 'gallons'
    case 'fiber': return 'lbs'
    case 'honey': return 'lbs'
    case 'meat': return 'lbs'
    default: return 'count'
  }
}
