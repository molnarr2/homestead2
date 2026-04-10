import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { bsAnimalTypeService } from '../../../Bootstrap'
import { animalType_default } from '../../../schema/animalType/AnimalType'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditAnimalType'>
type Route = RouteProp<RootStackParamList, 'EditAnimalType'>

export function useEditAnimalTypeController(navigation: Navigation, route: Route) {
  const animalTypeId = route.params?.animalTypeId
  const isEditing = !!animalTypeId

  const [name, setName] = useState('')
  const [colors, setColors] = useState<string[]>([])
  const [newColor, setNewColor] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (animalTypeId && !initialized) {
      bsAnimalTypeService.fetchAnimalType(animalTypeId).then(type => {
        if (type) {
          setName(type.name)
          setColors(type.colors)
          setInitialized(true)
        }
      })
    }
  }, [animalTypeId, initialized])

  const addColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors([...colors, newColor.trim()])
      setNewColor('')
    }
  }

  const removeColor = (color: string) => setColors(colors.filter(c => c !== color))

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a name for the animal type.')
      return
    }
    setLoading(true)
    if (isEditing) {
      const existing = await bsAnimalTypeService.fetchAnimalType(animalTypeId!)
      if (existing) {
        const result = await bsAnimalTypeService.updateAnimalType({
          ...existing,
          name: name.trim(),
          colors,
          admin: adminObject_updateLastUpdated(existing.admin),
        })
        if (!result.success) Alert.alert('Error', result.error)
      }
    } else {
      const newType = animalType_default()
      newType.name = name.trim()
      newType.colors = colors
      const result = await bsAnimalTypeService.createAnimalType(newType)
      if (!result.success) Alert.alert('Error', result.error)
    }
    setLoading(false)
    navigation.goBack()
  }

  const onDelete = () => {
    if (!animalTypeId) return
    Alert.alert(
      'Delete Animal Type',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            await bsAnimalTypeService.deleteAnimalType(animalTypeId)
            setLoading(false)
            navigation.goBack()
          },
        },
      ]
    )
  }

  const onBack = () => navigation.goBack()

  return { name, setName, colors, newColor, setNewColor, addColor, removeColor, loading, save, isEditing, onDelete, onBack }
}
