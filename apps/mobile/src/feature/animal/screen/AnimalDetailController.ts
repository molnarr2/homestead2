import { useState, useMemo, useCallback } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalStore } from '../../../store/animalStore'
import { useCareStore } from '../../../store/careStore'
import { useHealthStore } from '../../../store/healthStore'
import { useBreedingStore } from '../../../store/breedingStore'
import { useNoteStore } from '../../../store/noteStore'
import { useWeightStore } from '../../../store/weightStore'
import { useGroupStore } from '../../../store/groupStore'
import { calculateAnimalAge } from '../../../util/AnimalUtility'
import { getActiveWithdrawals } from '../../../util/WithdrawalUtility'
import type { AnimalTab } from '../component/AnimalDetailTabs'
import CareEvent from '../../../schema/care/CareEvent'
import HealthRecord from '../../../schema/health/HealthRecord'

export interface GroupCareEvent {
  event: CareEvent
  groupId: string
  groupName: string
}

export interface GroupHealthRecord {
  record: HealthRecord
  groupId: string
  groupName: string
}

type Navigation = NativeStackNavigationProp<RootStackParamList, 'AnimalDetail'>
type Route = RouteProp<RootStackParamList, 'AnimalDetail'>

export function useAnimalDetailController(navigation: Navigation, route: Route) {
  const { animalId } = route.params
  const { animals } = useAnimalStore()
  const animal = animals.find(a => a.id === animalId)

  const { careEvents } = useCareStore()
  const allHealthRecords = useHealthStore(s => s.healthRecords)
  const { breedingRecords } = useBreedingStore()
  const allNotes = useNoteStore(s => s.notes)
  const allWeightLogs = useWeightStore(s => s.weightLogs)
  const { groups, groupCareEvents, groupHealthRecords } = useGroupStore()

  const [activeTab, setActiveTab] = useState<AnimalTab>('timeline')

  const animalCareEvents = careEvents.filter(e => e.animalId === animalId)
  const healthRecords = useMemo(() => allHealthRecords.filter(r => r.animalId === animalId), [allHealthRecords, animalId])
  const breedingRecordsForAnimal = useMemo(() => breedingRecords.filter(r => r.animalId === animalId), [breedingRecords, animalId])
  const notes = useMemo(() => allNotes.filter(n => n.animalId === animalId), [allNotes, animalId])
  const weightLogs = useMemo(() => allWeightLogs.filter(w => w.animalId === animalId), [allWeightLogs, animalId])
  const activeWithdrawals = getActiveWithdrawals(healthRecords)

  const animalGroups = useMemo(() => groups.filter(g => g.animalIds.includes(animalId)), [groups, animalId])

  const groupCareEventsForAnimal = useMemo((): GroupCareEvent[] => {
    const result: GroupCareEvent[] = []
    for (const group of animalGroups) {
      const events = groupCareEvents[group.id] ?? []
      for (const event of events) {
        result.push({ event, groupId: group.id, groupName: group.name })
      }
    }
    return result
  }, [animalGroups, groupCareEvents])

  const groupHealthRecordsForAnimal = useMemo((): GroupHealthRecord[] => {
    const result: GroupHealthRecord[] = []
    for (const group of animalGroups) {
      const records = groupHealthRecords[group.id] ?? []
      for (const record of records) {
        result.push({ record, groupId: group.id, groupName: group.name })
      }
    }
    return result
  }, [animalGroups, groupHealthRecords])

  const age = calculateAnimalAge(animal?.birthday ?? '')

  const onBack = () => navigation.goBack()
  const onEdit = () => navigation.navigate('EditAnimal', { animalId })
  const onAddCare = () => navigation.navigate('CreateCareEvent', { animalId })
  const onAddHealth = () => navigation.navigate('CreateHealthRecord', { animalId })
  const onAddBreeding = () => navigation.navigate('CreateBreedingRecord', { animalId })
  const onAddNote = () => navigation.navigate('CreateNote', { animalId })
  const onAddWeight = () => navigation.navigate('CreateWeightLog', { animalId })
  const onGroupPress = (groupId: string) => navigation.navigate('GroupDetail', { groupId })

  const getFabAction = useCallback(() => {
    const actions: Record<AnimalTab, () => void> = {
      timeline: onAddCare,
      health: onAddHealth,
      breeding: onAddBreeding,
      care: onAddCare,
      notes: onAddNote,
      weight: onAddWeight,
    }
    return actions[activeTab]
  }, [activeTab, animalId])

  return {
    animal,
    age,
    activeWithdrawals,
    activeTab,
    setActiveTab,
    careEvents: animalCareEvents,
    healthRecords,
    breedingRecords: breedingRecordsForAnimal,
    notes,
    weightLogs,
    groupCareEvents: groupCareEventsForAnimal,
    groupHealthRecords: groupHealthRecordsForAnimal,
    onBack,
    onEdit,
    onAddCare,
    onAddHealth,
    onAddBreeding,
    onAddNote,
    onAddWeight,
    onGroupPress,
    getFabAction,
  }
}
