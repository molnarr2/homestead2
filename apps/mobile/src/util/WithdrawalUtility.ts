import { addDays, daysBetween, todayIso } from './DateUtility'
import HealthRecord from '../schema/health/HealthRecord'

export type WithdrawalStatus = 'ACTIVE' | 'CLEAR'

export interface WithdrawalResult {
  withdrawalEndDate: string
  daysRemaining: number
  status: WithdrawalStatus
  withdrawalType: string
  medicationName: string
}

export function calculateWithdrawal(
  dateAdministered: string,
  withdrawalPeriodDays: number,
  withdrawalType: string,
  medicationName: string = ''
): WithdrawalResult {
  const withdrawalEndDate = addDays(dateAdministered, withdrawalPeriodDays)
  const daysRemaining = daysBetween(todayIso(), withdrawalEndDate)
  const status: WithdrawalStatus = daysRemaining > 0 ? 'ACTIVE' : 'CLEAR'

  return {
    withdrawalEndDate,
    daysRemaining: Math.max(daysRemaining, 0),
    status,
    withdrawalType,
    medicationName,
  }
}

export function getActiveWithdrawals(healthRecords: HealthRecord[]): WithdrawalResult[] {
  const results: WithdrawalResult[] = []
  for (const record of healthRecords) {
    if (record.medicationWithdrawalDays > 0) {
      const result = calculateWithdrawal(
        record.date,
        record.medicationWithdrawalDays,
        record.medicationWithdrawalType,
        record.name
      )
      if (result.status === 'ACTIVE') results.push(result)
    }
    if (record.dewormingWithdrawalDays > 0) {
      const result = calculateWithdrawal(
        record.date,
        record.dewormingWithdrawalDays,
        record.dewormingWithdrawalType,
        record.name
      )
      if (result.status === 'ACTIVE') results.push(result)
    }
  }
  return results
}
