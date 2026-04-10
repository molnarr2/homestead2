import AdminObject, { adminObject_default } from '../object/AdminObject'

export default interface WeightLog {
  id: string
  admin: AdminObject
  animalId: string
  date: string
  weight: number
  weightUnit: 'lbs' | 'kg'
  bodyConditionScore: number
  notes: string
}

export function weightLog_default(): WeightLog {
  return {
    id: '',
    admin: adminObject_default(),
    animalId: '',
    date: '',
    weight: 0,
    weightUnit: 'lbs',
    bodyConditionScore: 3,
    notes: '',
  }
}
