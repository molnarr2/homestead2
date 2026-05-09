import { useState } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { NoteTag } from '../../../schema/notes/Note'
import { note_default } from '../../../schema/notes/Note'
import { useHomesteadStore } from '../../../store/homesteadStore'
import { useAnimalStore } from '../../../store/animalStore'
import { effectiveSubscription } from '../../subscription/service/ISubscriptionService'
import { bsNoteService } from '../../../Bootstrap'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateNote'>
type Route = RouteProp<RootStackParamList, 'CreateNote'>

export function useCreateNoteController(navigation: Navigation, route: Route) {
  const { animalId } = route.params
  const homestead = useHomesteadStore(s => s.homestead)
  const { animals } = useAnimalStore()
  const selectedAnimal = animals.find(a => a.id === animalId) ?? null

  const [text, setText] = useState('')
  const [tags, setTags] = useState<NoteTag[]>([])
  const [photoUri, setPhotoUri] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleTag = (tag: NoteTag) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const submit = async () => {
    const tier = effectiveSubscription(homestead)
    if (tier === 'free') {
      Alert.alert(
        'Pro Feature',
        'Notes are available with a Pro or Farm subscription. Upgrade to start capturing observations.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
        ]
      )
      return
    }

    if (!text.trim()) return
    setLoading(true)
    const note = {
      ...note_default(),
      animalId,
      text: text.trim(),
      tags,
    }
    await bsNoteService.createNote(note, photoUri || undefined)
    setLoading(false)
    navigation.goBack()
  }

  const onBack = () => navigation.goBack()

  return { selectedAnimal, text, setText, tags, toggleTag, photoUri, setPhotoUri, loading, submit, onBack }
}
