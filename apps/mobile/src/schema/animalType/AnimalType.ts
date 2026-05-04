import AdminObject, { adminObject_default } from '../object/AdminObject'
import EventExtraDataObject from '../object/EventExtraDataObject'

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
}

export interface AnimalTypeEventTemplate {
  id: string
  name: string
  extraData: EventExtraDataObject[]
}

export default interface AnimalType {
  id: string
  admin: AdminObject
  name: string
  colors: string[]
  breeds: AnimalTypeBreed[]
  careTemplates: AnimalTypeCareTemplate[]
  eventTemplates: AnimalTypeEventTemplate[]
}

export function animalType_default(): AnimalType {
  return {
    id: '',
    admin: adminObject_default(),
    name: '',
    colors: [],
    breeds: [],
    careTemplates: [],
    eventTemplates: [],
  }
}
