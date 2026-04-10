import AdminObject, { adminObject_default } from '../object/AdminObject'

export type NoteTag = 'Health' | 'Behavior' | 'Breeding' | 'Feed' | 'Production' | 'General'

export default interface Note {
  id: string
  admin: AdminObject
  animalId: string
  tags: NoteTag[]
  text: string
  photoStorageRef: string
  photoUrl: string
}

export function note_default(): Note {
  return {
    id: '',
    admin: adminObject_default(),
    animalId: '',
    tags: [],
    text: '',
    photoStorageRef: '',
    photoUrl: '',
  }
}
