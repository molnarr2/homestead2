import { useState, useEffect } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { bsNoteService } from '../../../Bootstrap'
import Note from '../../../schema/notes/Note'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'NoteDetail'>
type Route = RouteProp<RootStackParamList, 'NoteDetail'>

export function useNoteDetailController(navigation: Navigation, route: Route) {
  const { noteId, animalId } = route.params
  const [note, setNote] = useState<Note | null>(null)

  useEffect(() => {
    loadNote()
  }, [noteId])

  const loadNote = async () => {
    const notes = await bsNoteService.fetchNotesByAnimal(animalId)
    const found = notes.find(n => n.id === noteId)
    if (found) setNote(found)
  }

  const onDelete = async () => {
    await bsNoteService.deleteNote(noteId)
    navigation.goBack()
  }

  const onBack = () => navigation.goBack()

  return { note, onDelete, onBack }
}
