import AdminObject, { adminObject_default } from '../object/AdminObject'

export default interface Homestead {
  id: string
  admin: AdminObject
  name: string
}

export function homestead_default(): Homestead {
  return {
    id: '',
    admin: adminObject_default(),
    name: '',
  }
}
