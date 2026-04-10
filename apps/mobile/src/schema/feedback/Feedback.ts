import AdminObject, { adminObject_default } from '../object/AdminObject'

export default interface Feedback {
  id: string
  admin: AdminObject
  userId: string
  email: string
  rating: number
  feedback: string
  os: 'iOS' | 'Android'
  version: string
}

export function feedback_default(): Feedback {
  return {
    id: '',
    admin: adminObject_default(),
    userId: '',
    email: '',
    rating: 0,
    feedback: '',
    os: 'iOS',
    version: '',
  }
}
