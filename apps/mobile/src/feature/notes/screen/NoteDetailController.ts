import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useNoteStore } from '../../../store/noteStore'
import { bsNoteService } from '../../../Bootstrap'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'NoteDetail'>
type Route = RouteProp<RootStackParamList, 'NoteDetail'>

export function useNoteDetailController(navigation: Navigation, route: Route) {
  const { noteId } = route.params
  const note = useNoteStore(s => s.notes.find(n => n.id === noteId) ?? null)

  const { animalId } = route.params

  const onDelete = async () => {
    await bsNoteService.deleteNote(noteId)
    navigation.goBack()
  }

  const onBack = () => navigation.goBack()
  const onEdit = () => navigation.navigate('EditNote', { noteId, animalId })

  return { note, onDelete, onBack, onEdit }
}
