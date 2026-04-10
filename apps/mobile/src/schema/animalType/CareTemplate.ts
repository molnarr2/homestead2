import AdminObject, { adminObject_default } from '../object/AdminObject'
import EventExtraDataObject from '../object/EventExtraDataObject'

export default interface CareTemplate {
  id: string
  admin: AdminObject
  name: string
  type: 'careRecurring' | 'careSingle'
  cycle: number
  contactName: string
  contactPhone: string
  extraData: EventExtraDataObject[]
}

export function careTemplate_default(): CareTemplate {
  return {
    id: '',
    admin: adminObject_default(),
    name: '',
    type: 'careSingle',
    cycle: 0,
    contactName: '',
    contactPhone: '',
    extraData: [],
  }
}
