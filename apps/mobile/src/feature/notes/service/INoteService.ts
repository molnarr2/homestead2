import { IResult } from '../../../util/Result'
import Note from '../../../schema/notes/Note'

export default interface INoteService {
  subscribeNotes(callback: (notes: Note[]) => void): () => void
  createNote(note: Note, photoUri?: string): Promise<IResult>
  deleteNote(noteId: string): Promise<IResult>
}
