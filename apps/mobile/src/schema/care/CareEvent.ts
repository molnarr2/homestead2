import AdminObject, { adminObject_default } from '../object/AdminObject'
import { Tstamp, tstampServerTime } from '../type/Tstamp'
import type { HealthRecordType } from '../health/HealthRecord'

export type CareEventType = 'careRecurring' | 'careSingle'

export default interface CareEvent {
  id: string
  admin: AdminObject
  animalId: string
  templateId: string
  name: string
  type: CareEventType
  cycle: number
  dueDate: Tstamp
  completedDate: Tstamp | null
  contactName: string
  contactPhone: string
  notes: string
  photoStorageRef: string
  photoUrl: string
  createdNextRecurringEvent: boolean
  healthRecordType: HealthRecordType | ''
}

export function careEvent_default(): CareEvent {
  return {
    id: '',
    admin: adminObject_default(),
    animalId: '',
    templateId: '',
    name: '',
    type: 'careSingle',
    cycle: 0,
    dueDate: tstampServerTime(),
    completedDate: null,
    contactName: '',
    contactPhone: '',
    notes: '',
    photoStorageRef: '',
    photoUrl: '',
    createdNextRecurringEvent: false,
    healthRecordType: '',
  }
}
