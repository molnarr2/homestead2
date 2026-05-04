import { useState } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditBreed'>
type Route = RouteProp<RootStackParamList, 'EditBreed'>

export function useEditBreedController(navigation: Navigation, route: Route) {
  const { animalTypeId, breedId } = route.params
  const isEditing = !!breedId
  const { animalTypes, addBreed, updateBreed, deleteBreed } = useAnimalTypeStore()

  const animalType = animalTypes.find(t => t.id === animalTypeId)
  const existingBreed = breedId ? animalType?.breeds.find(b => b.id === breedId) : undefined

  const [name, setName] = useState(existingBreed?.name ?? '')
  const [gestationDays, setGestationDays] = useState(String(existingBreed?.gestationDays ?? 0))
  const [loading, setLoading] = useState(false)

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a breed name.')
      return
    }
    setLoading(true)
    const days = parseInt(gestationDays, 10) || 0
    if (isEditing && breedId) {
      const result = await updateBreed(animalTypeId, {
        id: breedId,
        name: name.trim(),
        gestationDays: days,
      })
      if (!result.success) Alert.alert('Error', result.error)
    } else {
      const result = await addBreed(animalTypeId, {
        name: name.trim(),
        gestationDays: days,
      })
      if (!result.success) Alert.alert('Error', result.error)
    }
    setLoading(false)
    navigation.goBack()
  }

  const onDelete = () => {
    if (!breedId) return
    Alert.alert(
      'Delete Breed',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            await deleteBreed(animalTypeId, breedId)
            setLoading(false)
            navigation.goBack()
          },
        },
      ]
    )
  }

  const onBack = () => navigation.goBack()

  return { name, setName, gestationDays, setGestationDays, loading, save, isEditing, onDelete, onBack }
}
