import AdminObject, { adminObject_default } from '../object/AdminObject'

export default interface AnimalGroup {
  id: string
  admin: AdminObject
  userId: string
  name: string
  animalIds: string[]
  photoStorageRef: string
  photoUrl: string
}

export function animalGroup_default(): AnimalGroup {
  return {
    id: '',
    admin: adminObject_default(),
    userId: '',
    name: '',
    animalIds: [],
    photoStorageRef: '',
    photoUrl: '',
  }
}
