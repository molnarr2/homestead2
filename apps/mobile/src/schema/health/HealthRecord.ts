import AdminObject, { adminObject_default } from '../object/AdminObject'

export type HealthRecordType = 'vaccination' | 'medication' | 'deworming' | 'vetVisit' | 'illness' | 'injury'
export type DosageUnit = 'mL' | 'mg' | 'cc' | 'tablets'
export type MedicationRoute = 'Oral' | 'Injection' | 'Topical' | 'IV' | 'Intranasal' | 'Subcutaneous' | 'Intramuscular'
export type DewormingRoute = 'Oral' | 'Injectable' | 'Pour-On' | 'Feed Additive'
export type WithdrawalType = 'meat' | 'milk' | 'eggs' | 'all'

export default interface HealthRecord {
  id: string
  admin: AdminObject
  animalId: string
  recordType: HealthRecordType
  name: string
  date: string
  providerName: string
  providerPhone: string
  notes: string
  photoStorageRef: string
  photoUrl: string
  cost: number
  vaccineLotNumber: string
  vaccineNextDueDate: string
  vaccineRoute: MedicationRoute
  medicationDosage: number
  medicationDosageUnit: DosageUnit
  medicationRoute: MedicationRoute
  medicationFrequency: string
  medicationWithdrawalDays: number
  medicationWithdrawalType: WithdrawalType
  dewormingDosage: number
  dewormingDosageUnit: DosageUnit
  dewormingRoute: DewormingRoute
  dewormingWithdrawalDays: number
  dewormingWithdrawalType: WithdrawalType
  vetClinicName: string
  vetDiagnosis: string
  vetTreatmentNotes: string
  vetFollowUpDate: string
  symptoms: string
  treatment: string
  resolvedDate: string
  outcome: string
}

export function healthRecord_default(): HealthRecord {
  return {
    id: '',
    admin: adminObject_default(),
    animalId: '',
    recordType: 'vaccination',
    name: '',
    date: '',
    providerName: '',
    providerPhone: '',
    notes: '',
    photoStorageRef: '',
    photoUrl: '',
    cost: 0,
    vaccineLotNumber: '',
    vaccineNextDueDate: '',
    vaccineRoute: 'Injection',
    medicationDosage: 0,
    medicationDosageUnit: 'mL',
    medicationRoute: 'Oral',
    medicationFrequency: '',
    medicationWithdrawalDays: 0,
    medicationWithdrawalType: 'all',
    dewormingDosage: 0,
    dewormingDosageUnit: 'mL',
    dewormingRoute: 'Oral',
    dewormingWithdrawalDays: 0,
    dewormingWithdrawalType: 'all',
    vetClinicName: '',
    vetDiagnosis: '',
    vetTreatmentNotes: '',
    vetFollowUpDate: '',
    symptoms: '',
    treatment: '',
    resolvedDate: '',
    outcome: '',
  }
}
