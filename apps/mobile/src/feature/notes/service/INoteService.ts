import { IResult } from '../../../util/Result'
import Note from '../../../schema/notes/Note'

export default interface INoteService {
  fetchNotesByAnimal(animalId: string): Promise<Note[]>
  createNote(note: Note, photoUri?: string): Promise<IResult>
  deleteNote(noteId: string): Promise<IResult>
}
