import AdminObject, { adminObject_default } from '../object/AdminObject'

export type HomesteadRole = 'owner' | 'manager' | 'caretaker' | 'viewer'

export default interface HomesteadMember {
  id: string
  admin: AdminObject
  userId: string
  role: HomesteadRole
  displayName: string
  email: string
}

export function homesteadMember_default(): HomesteadMember {
  return {
    id: '',
    admin: adminObject_default(),
    userId: '',
    role: 'viewer',
    displayName: '',
    email: '',
  }
}
