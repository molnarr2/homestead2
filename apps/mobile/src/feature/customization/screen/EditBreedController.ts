import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { bsAnimalTypeService } from '../../../Bootstrap'
import { breed_default } from '../../../schema/animalType/Breed'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditBreed'>
type Route = RouteProp<RootStackParamList, 'EditBreed'>

export function useEditBreedController(navigation: Navigation, route: Route) {
  const { animalTypeId, breedId } = route.params
  const isEditing = !!breedId

  const [name, setName] = useState('')
  const [gestationDays, setGestationDays] = useState('0')
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (breedId && !initialized) {
      bsAnimalTypeService.getBreedsForType(animalTypeId).then(breeds => {
        const breed = breeds.find(b => b.id === breedId)
        if (breed) {
          setName(breed.name)
          setGestationDays(String(breed.gestationDays || 0))
          setInitialized(true)
        }
      })
    }
  }, [breedId, initialized])

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a breed name.')
      return
    }
    setLoading(true)
    const days = parseInt(gestationDays, 10) || 0
    if (isEditing) {
      const breeds = await bsAnimalTypeService.getBreedsForType(animalTypeId)
      const existing = breeds.find(b => b.id === breedId)
      if (existing) {
        const result = await bsAnimalTypeService.updateBreed(animalTypeId, {
          ...existing,
          name: name.trim(),
          gestationDays: days,
          admin: adminObject_updateLastUpdated(existing.admin),
        })
        if (!result.success) Alert.alert('Error', result.error)
      }
    } else {
      const newBreed = breed_default()
      newBreed.name = name.trim()
      newBreed.gestationDays = days
      const result = await bsAnimalTypeService.createBreed(animalTypeId, newBreed)
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
            await bsAnimalTypeService.deleteBreed(animalTypeId, breedId)
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
