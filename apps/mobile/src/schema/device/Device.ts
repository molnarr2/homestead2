import AdminObject, { adminObject_default } from '../object/AdminObject'

export default interface Device {
  id: string
  admin: AdminObject
  schemaVersion: number
  userId: string
  tokenId: string
  platform: string
}

export function device_default(): Device {
  return {
    id: '',
    admin: adminObject_default(),
    schemaVersion: 2,
    userId: '',
    tokenId: '',
    platform: '',
  }
}
