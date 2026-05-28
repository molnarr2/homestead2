import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalStore } from '../../../store/animalStore'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'
import { useGroupStore } from '../../../store/groupStore'
import { bsCareService, bsGroupService } from '../../../Bootstrap'
import { CareEventType, careEvent_default } from '../../../schema/care/CareEvent'
import { adminObject_default } from '../../../schema/object/AdminObject'
import { dateToTstamp } from '../../../schema/type/Tstamp'
import { AnimalTypeCareTemplate } from '../../../schema/animalType/AnimalType'
import type { HealthRecordType } from '../../../schema/health/HealthRecord'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateCareEvent'>
type Route = RouteProp<RootStackParamList, 'CreateCareEvent'>

export function useCreateCareEventController(navigation: Navigation, route: Route) {
  const {
    animalId: routeAnimalId,
    templateId,
    groupId: routeGroupId,
    name: routeName,
    dueDate: routeDueDate,
    contactName: routeContactName,
    contactPhone: routeContactPhone,
    healthRecordType: routeHealthRecordType,
  } = route.params
  const { animals } = useAnimalStore()
  const { animalTypes } = useAnimalTypeStore()
  const { groups } = useGroupStore()

  const [selectedAnimalId, setSelectedAnimalId] = useState(routeGroupId ? '' : (routeAnimalId ?? ''))
  const [selectedGroupId, setSelectedGroupId] = useState(routeGroupId ?? '')
  const [name, setName] = useState(routeName ?? '')
  const [type, setType] = useState<CareEventType>('careSingle')
  const [cycle, setCycle] = useState(0)
  const [dueDate, setDueDate] = useState(routeDueDate ?? '')
  const [contactName, setContactName] = useState(routeContactName ?? '')
  const [contactPhone, setContactPhone] = useState(routeContactPhone ?? '')
  const [notes, setNotes] = useState('')
  const [healthRecordType, setHealthRecordType] = useState<HealthRecordType | ''>(routeHealthRecordType ?? '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (templateId) {
      const allTemplates = animalTypes.flatMap(t => t.careTemplates)
      const template = allTemplates.find(t => t.id === templateId)
      if (template) {
        setName(template.name)
        setType(template.type)
        setCycle(template.cycle)
        setContactName(template.contactName)
        setContactPhone(template.contactPhone)
        setHealthRecordType(template.healthRecordType ?? '')
      }
    }
  }, [templateId])

  const handleSelectAnimal = (animalId: string) => {
    setSelectedAnimalId(animalId)
    setSelectedGroupId('')
  }

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId)
    setSelectedAnimalId('')
  }

  const submit = async () => {
    if (!name.trim() || (!selectedAnimalId && !selectedGroupId) || !dueDate) {
      Alert.alert('Required', 'Please enter a name, select an animal or group, and set a due date.')
      return
    }

    setLoading(true)
    const event = {
      ...careEvent_default(),
      animalId: selectedAnimalId,
      templateId: templateId ?? '',
      name: name.trim(),
      type,
      cycle: type === 'careRecurring' ? cycle : 0,
      dueDate: dateToTstamp(dueDate ? new Date(dueDate) : new Date()),
      contactName,
      contactPhone,
      notes,
      healthRecordType,
      admin: adminObject_default(),
    }

    let result
    if (selectedGroupId) {
      result = await bsGroupService.createGroupCareEvent(selectedGroupId, event)
    } else {
      result = await bsCareService.createCareEvent(event)
    }

    setLoading(false)
    if (result.success) {
      navigation.goBack()
    } else {
      Alert.alert('Error', result.error)
    }
  }

  const applyTemplate = (template: AnimalTypeCareTemplate) => {
    setName(template.name)
    setType(template.type)
    setCycle(template.cycle)
    setContactName(template.contactName)
    setContactPhone(template.contactPhone)
    setHealthRecordType(template.healthRecordType ?? '')
  }

  const onBack = () => navigation.goBack()

  const isReadOnly = !!(routeAnimalId || routeGroupId)
  const selectedAnimal = animals.find(a => a.id === selectedAnimalId) ?? null
  const selectedGroup = groups.find(g => g.id === selectedGroupId) ?? null

  const templateFilterTypeIds: string[] = (() => {
    if (selectedAnimal) return [selectedAnimal.animalTypeId]
    if (selectedGroup) {
      const ids = new Set(
        selectedGroup.animalIds
          .map(id => animals.find(a => a.id === id)?.animalTypeId)
          .filter((id): id is string => !!id)
      )
      return [...ids]
    }
    return []
  })()

  return {
    selectedAnimalId, setSelectedAnimalId: handleSelectAnimal,
    selectedGroupId, setSelectedGroupId: handleSelectGroup,
    selectedAnimal,
    selectedGroup,
    isReadOnly,
    name, setName,
    type, setType,
    cycle, setCycle,
    dueDate, setDueDate,
    contactName, setContactName,
    contactPhone, setContactPhone,
    notes, setNotes,
    healthRecordType, setHealthRecordType,
    loading,
    animals,
    submit,
    onBack,
    applyTemplate,
    templateFilterTypeIds,
  }
}
