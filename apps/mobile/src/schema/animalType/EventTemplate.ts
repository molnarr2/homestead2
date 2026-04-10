import AdminObject, { adminObject_default } from '../object/AdminObject'
import EventExtraDataObject from '../object/EventExtraDataObject'

export default interface EventTemplate {
  id: string
  admin: AdminObject
  name: string
  extraData: EventExtraDataObject[]
}

export function eventTemplate_default(): EventTemplate {
  return {
    id: '',
    admin: adminObject_default(),
    name: '',
    extraData: [],
  }
}
