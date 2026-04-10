import AdminObject, { adminObject_default } from '../object/AdminObject'

export type BreedingMethod = 'natural' | 'ai' | 'other'
export type BreedingStatus = 'active' | 'completed' | 'failed'
export type DamCondition = 'Good' | 'Fair' | 'Poor'

export interface BirthOutcome {
  birthDate: string
  bornAlive: number
  stillborn: number
  complications: string
  damCondition: DamCondition
  sireId: string
}

export default interface BreedingRecord {
  id: string
  admin: AdminObject
  animalId: string
  sireId: string
  sireName: string
  breedingDate: string
  expectedDueDate: string
  method: BreedingMethod
  notes: string
  status: BreedingStatus
  birthDate: string
  bornAlive: number
  stillborn: number
  complications: string
  damCondition: DamCondition
  offspringIds: string[]
}

export function breedingRecord_default(): BreedingRecord {
  return {
    id: '',
    admin: adminObject_default(),
    animalId: '',
    sireId: '',
    sireName: '',
    breedingDate: '',
    expectedDueDate: '',
    method: 'natural',
    notes: '',
    status: 'active',
    birthDate: '',
    bornAlive: 0,
    stillborn: 0,
    complications: '',
    damCondition: 'Good',
    offspringIds: [],
  }
}
