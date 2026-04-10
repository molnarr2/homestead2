import { IResult } from '../../../util/Result'
import Note from '../../../schema/notes/Note'

export default interface INoteService {
  getNotesForAnimal(animalId: string): Promise<Note[]>
  createNote(note: Note): Promise<IResult>
  updateNote(note: Note): Promise<IResult>
  deleteNote(id: string): Promise<IResult>
  uploadNotePhoto(noteId: string, uri: string): Promise<{ url: string, ref: string } | null>
}
