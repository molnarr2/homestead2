import { create } from 'zustand'
import { IResult } from '../util/Result'
import Note from '../schema/notes/Note'
import { bsNoteService } from '../Bootstrap'

interface NoteState {
  notes: Note[]
  loading: boolean
  fetchByAnimal: (animalId: string) => Promise<void>
  createNote: (note: Note) => Promise<IResult>
  deleteNote: (noteId: string) => Promise<IResult>
  clear: () => void
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  loading: false,

  fetchByAnimal: async (animalId: string) => {
    set({ loading: true })
    const notes = await bsNoteService.getNotesForAnimal(animalId)
    set({ notes, loading: false })
  },

  createNote: (note: Note) => bsNoteService.createNote(note),
  deleteNote: (noteId: string) => bsNoteService.deleteNote(noteId),

  clear: () => {
    set({ notes: [], loading: false })
  },
}))
