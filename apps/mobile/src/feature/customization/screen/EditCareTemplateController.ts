import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { bsAnimalTypeService } from '../../../Bootstrap'
import { careTemplate_default } from '../../../schema/animalType/CareTemplate'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditCareTemplate'>
type Route = RouteProp<RootStackParamList, 'EditCareTemplate'>

export function useEditCareTemplateController(navigation: Navigation, route: Route) {
  const { animalTypeId, templateId } = route.params
  const isEditing = !!templateId

  const [name, setName] = useState('')
  const [type, setType] = useState<'careRecurring' | 'careSingle'>('careSingle')
  const [cycle, setCycle] = useState('0')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (templateId && !initialized) {
      bsAnimalTypeService.getCareTemplatesForType(animalTypeId).then(templates => {
        const template = templates.find(t => t.id === templateId)
        if (template) {
          setName(template.name)
          setType(template.type)
          setCycle(String(template.cycle || 0))
          setContactName(template.contactName || '')
          setContactPhone(template.contactPhone || '')
          setInitialized(true)
        }
      })
    }
  }, [templateId, initialized])

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a template name.')
      return
    }
    setLoading(true)
    const cycleDays = parseInt(cycle, 10) || 0
    if (isEditing) {
      const templates = await bsAnimalTypeService.getCareTemplatesForType(animalTypeId)
      const existing = templates.find(t => t.id === templateId)
      if (existing) {
        const result = await bsAnimalTypeService.updateCareTemplate(animalTypeId, {
          ...existing,
          name: name.trim(),
          type,
          cycle: cycleDays,
          contactName: contactName.trim(),
          contactPhone: contactPhone.trim(),
          admin: adminObject_updateLastUpdated(existing.admin),
        })
        if (!result.success) Alert.alert('Error', result.error)
      }
    } else {
      const newTemplate = careTemplate_default()
      newTemplate.name = name.trim()
      newTemplate.type = type
      newTemplate.cycle = cycleDays
      newTemplate.contactName = contactName.trim()
      newTemplate.contactPhone = contactPhone.trim()
      const result = await bsAnimalTypeService.createCareTemplate(animalTypeId, newTemplate)
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
            await bsAnimalTypeService.deleteCareTemplate(animalTypeId, templateId)
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
