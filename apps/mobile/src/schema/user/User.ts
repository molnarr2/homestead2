import AdminObject, { adminObject_default } from '../object/AdminObject'

export default interface User {
  id: string
  admin: AdminObject
  schemaVersion: number
  firstName: string
  lastName: string
  email: string
  anonymous: boolean
  selectedSpecies: string[]
  avatarUrl: string
  photoStorageRef: string
  activeHomesteadId: string
}

export function user_default(): User {
  return {
    id: '',
    admin: adminObject_default(),
    schemaVersion: 2,
    firstName: '',
    lastName: '',
    email: '',
    anonymous: false,
    selectedSpecies: [],
    avatarUrl: '',
    photoStorageRef: '',
    activeHomesteadId: '',
  }
}
