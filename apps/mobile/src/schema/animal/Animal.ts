import AdminObject, { adminObject_default } from '../object/AdminObject'

export type AnimalState = 'own' | 'sold' | 'deceased' | 'processed'
export type AnimalGender = 'male' | 'female' | 'unknown'

export default interface Animal {
  id: string
  admin: AdminObject
  name: string
  animalType: string
  animalTypeId: string
  animalTypeLevel: string
  breed: string
  animalBreedId: string
  birthday: string
  gender: AnimalGender
  color: string
  register: string
  state: AnimalState
  notes: string
  photoStorageRef: string
  photoUrl: string
  purchasePrice: number
  weight: number
  weightUnit: 'lbs' | 'kg'
  sireId: string
  damId: string
}

export function animal_default(): Animal {
  return {
    id: '',
    admin: adminObject_default(),
    name: '',
    animalType: '',
    animalTypeId: '',
    animalTypeLevel: '',
    breed: '',
    animalBreedId: '',
    birthday: '',
    gender: 'unknown',
    color: '',
    register: '',
    state: 'own',
    notes: '',
    photoStorageRef: '',
    photoUrl: '',
    purchasePrice: 0,
    weight: 0,
    weightUnit: 'lbs',
    sireId: '',
    damId: '',
  }
}
