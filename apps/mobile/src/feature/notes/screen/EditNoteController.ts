import { useState } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useNoteStore } from '../../../store/noteStore'
import { useAnimalStore } from '../../../store/animalStore'
import { NoteTag } from '../../../schema/notes/Note'
import { bsNoteService } from '../../../Bootstrap'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditNote'>
type Route = RouteProp<RootStackParamList, 'EditNote'>

export function useEditNoteController(navigation: Navigation, route: Route) {
  const { noteId } = route.params
  const note = useNoteStore(s => s.notes.find(n => n.id === noteId))
  const { animals } = useAnimalStore()
  const selectedAnimal = animals.find(a => a.id === note?.animalId) ?? null

  const [text, setText] = useState(note?.text ?? '')
  const [tags, setTags] = useState<NoteTag[]>(note?.tags ?? [])
  const [photoUri, setPhotoUri] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleTag = (tag: NoteTag) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const submit = async () => {
    if (!note) return
    if (!text.trim()) return

    setLoading(true)
    const updated = {
      ...note,
      text: text.trim(),
      tags,
    }
    const newPhotoUri = photoUri && photoUri !== note.photoUrl ? photoUri : undefined
    const result = await bsNoteService.updateNote(updated, newPhotoUri)
    setLoading(false)
    if (result.success) {
      navigation.goBack()
    } else {
      Alert.alert('Error', result.error)
    }
  }

  const onBack = () => navigation.goBack()

  return { note, selectedAnimal, text, setText, tags, toggleTag, photoUri, setPhotoUri, loading, submit, onBack }
}
