import AdminObject, { adminObject_default } from '../object/AdminObject'
import type { HealthRecordType } from '../health/HealthRecord'

export interface AnimalTypeBreed {
  id: string
  name: string
  gestationDays: number
}

export interface AnimalTypeCareTemplate {
  id: string
  name: string
  type: 'careRecurring' | 'careSingle'
  cycle: number
  contactName: string
  contactPhone: string
  healthRecordType: HealthRecordType | ''
}

export default interface AnimalType {
  id: string
  admin: AdminObject
  name: string
  colors: string[]
  breeds: AnimalTypeBreed[]
  careTemplates: AnimalTypeCareTemplate[]
}

export function animalType_default(): AnimalType {
  return {
    id: '',
    admin: adminObject_default(),
    name: '',
    colors: [],
    breeds: [],
    careTemplates: [],
  }
}
