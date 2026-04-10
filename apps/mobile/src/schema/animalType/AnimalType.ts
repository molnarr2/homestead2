import AdminObject, { adminObject_default } from '../object/AdminObject'

export default interface AnimalType {
  id: string
  admin: AdminObject
  name: string
  colors: string[]
}

export function animalType_default(): AnimalType {
  return {
    id: '',
    admin: adminObject_default(),
    name: '',
    colors: [],
  }
}
