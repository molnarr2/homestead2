import { create } from 'zustand'
import { IResult } from '../util/Result'
import Note from '../schema/notes/Note'
import { bsNoteService } from '../Bootstrap'

interface NoteState {
  notes: Note[]
  loading: boolean
  unsubscribe: (() => void) | null
  subscribe: () => void
  teardown: () => void
  createNote: (note: Note, photoUri?: string) => Promise<IResult>
  deleteNote: (noteId: string) => Promise<IResult>
  clear: () => void
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  loading: true,
  unsubscribe: null,

  subscribe: () => {
    get().teardown()
    set({ loading: true })
    const unsub = bsNoteService.subscribeNotes((notes) => {
      set({ notes, loading: false })
    })
    set({ unsubscribe: unsub })
  },

  teardown: () => {
    const unsub = get().unsubscribe
    if (unsub) unsub()
    set({ unsubscribe: null })
  },

  createNote: (note: Note, photoUri?: string) => bsNoteService.createNote(note, photoUri),
  deleteNote: (noteId: string) => bsNoteService.deleteNote(noteId),

  clear: () => {
    get().teardown()
    set({ notes: [], loading: true, unsubscribe: null })
  },
}))
