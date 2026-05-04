import { useState } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditCareTemplate'>
type Route = RouteProp<RootStackParamList, 'EditCareTemplate'>

export function useEditCareTemplateController(navigation: Navigation, route: Route) {
  const { animalTypeId, templateId } = route.params
  const isEditing = !!templateId
  const { animalTypes, addCareTemplate, updateCareTemplate, deleteCareTemplate } = useAnimalTypeStore()

  const animalType = animalTypes.find(t => t.id === animalTypeId)
  const existingTemplate = templateId ? animalType?.careTemplates.find(t => t.id === templateId) : undefined

  const [name, setName] = useState(existingTemplate?.name ?? '')
  const [type, setType] = useState<'careRecurring' | 'careSingle'>(existingTemplate?.type ?? 'careSingle')
  const [cycle, setCycle] = useState(String(existingTemplate?.cycle ?? 0))
  const [contactName, setContactName] = useState(existingTemplate?.contactName ?? '')
  const [contactPhone, setContactPhone] = useState(existingTemplate?.contactPhone ?? '')
  const [loading, setLoading] = useState(false)

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a template name.')
      return
    }
    setLoading(true)
    const cycleDays = parseInt(cycle, 10) || 0
    if (isEditing && templateId) {
      const result = await updateCareTemplate(animalTypeId, {
        id: templateId,
        name: name.trim(),
        type,
        cycle: cycleDays,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
      })
      if (!result.success) Alert.alert('Error', result.error)
    } else {
      const result = await addCareTemplate(animalTypeId, {
        name: name.trim(),
        type,
        cycle: cycleDays,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
      })
      if (!result.success) Alert.alert('Error', result.error)
    }
    setLoading(false)
    navigation.goBack()
  }

  const onDelete = () => {
    if (!templateId) return
    Alert.alert(
      'Delete Care Template',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            await deleteCareTemplate(animalTypeId, templateId)
            setLoading(false)
            navigation.goBack()
          },
        },
      ]
    )
  }

  const onBack = () => navigation.goBack()

  return { name, setName, type, setType, cycle, setCycle, contactName, setContactName, contactPhone, setContactPhone, loading, save, isEditing, onDelete, onBack }
}
