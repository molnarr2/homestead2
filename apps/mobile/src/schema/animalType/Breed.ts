import AdminObject, { adminObject_default } from '../object/AdminObject'

export default interface Breed {
  id: string
  admin: AdminObject
  name: string
  gestationDays: number
}

export function breed_default(): Breed {
  return {
    id: '',
    admin: adminObject_default(),
    name: '',
    gestationDays: 0,
  }
}
