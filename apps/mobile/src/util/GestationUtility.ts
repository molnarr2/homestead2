import { GESTATION_TABLE, isPoultry, getGestationLabel } from '../schema/type/GestationTable'
import { addDays, daysBetween, todayIso } from './DateUtility'

export interface GestationStatus {
  expectedDueDate: string
  daysRemaining: number
  progressPercent: number
  label: string
  isOverdue: boolean
}

export function calculateGestation(
  breedingDate: string,
  animalType: string,
  breedGestationOverride?: number
): GestationStatus {
  const gestationDays = breedGestationOverride && breedGestationOverride > 0
    ? breedGestationOverride
    : GESTATION_TABLE[animalType] ?? 0

  const expectedDueDate = addDays(breedingDate, gestationDays)
  const daysRemaining = daysBetween(todayIso(), expectedDueDate)
  const elapsed = gestationDays - daysRemaining
  const progressPercent = gestationDays > 0
    ? Math.min(Math.max((elapsed / gestationDays) * 100, 0), 100)
    : 0

  return {
    expectedDueDate,
    daysRemaining: Math.max(daysRemaining, 0),
    progressPercent,
    label: getGestationLabel(animalType),
    isOverdue: daysRemaining < 0,
  }
}
