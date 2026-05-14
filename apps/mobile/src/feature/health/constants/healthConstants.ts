import Icon from '@react-native-vector-icons/material-design-icons'
import type { HealthRecordType, DosageUnit, MedicationRoute, DewormingRoute, WithdrawalType } from '../../../schema/health/HealthRecord'

type IconName = React.ComponentProps<typeof Icon>['name']

export const DOSAGE_UNITS: DosageUnit[] = ['mL', 'mg', 'cc', 'tablets']

export const MEDICATION_ROUTES: MedicationRoute[] = ['Oral', 'Injection', 'Topical', 'IV', 'Intranasal', 'Subcutaneous', 'Intramuscular']

export const DEWORMING_ROUTES: DewormingRoute[] = ['Oral', 'Injectable', 'Pour-On', 'Feed Additive']

export const WITHDRAWAL_TYPES: WithdrawalType[] = ['meat', 'milk', 'eggs', 'all']

export interface HealthRecordTypeConfig {
  type: HealthRecordType
  label: string
  icon: IconName
}

export const HEALTH_RECORD_TYPES: HealthRecordTypeConfig[] = [
  { type: 'vaccination', label: 'Vaccination', icon: 'needle' },
  { type: 'medication', label: 'Medication', icon: 'pill' },
  { type: 'deworming', label: 'Deworming', icon: 'bug' },
  { type: 'vetVisit', label: 'Vet Visit', icon: 'stethoscope' },
  { type: 'illness', label: 'Illness', icon: 'thermometer' },
  { type: 'injury', label: 'Injury', icon: 'bandage' },
]

export const HEALTH_RECORD_TYPE_ICONS: Record<string, IconName> = Object.fromEntries(
  HEALTH_RECORD_TYPES.map(t => [t.type, t.icon])
) as Record<string, IconName>
