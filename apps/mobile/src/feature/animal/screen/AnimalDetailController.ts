import { useState, useEffect, useCallback } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalStore } from '../../../store/animalStore'
import { useCareStore } from '../../../store/careStore'
import { useHealthStore } from '../../../store/healthStore'
import { useBreedingStore } from '../../../store/breedingStore'
import { useNoteStore } from '../../../store/noteStore'
import { useWeightStore } from '../../../store/weightStore'
import { calculateAnimalAge } from '../../../util/AnimalUtility'
import { getActiveWithdrawals } from '../../../util/WithdrawalUtility'
import type { AnimalTab } from '../component/AnimalDetailTabs'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'AnimalDetail'>
type Route = RouteProp<RootStackParamList, 'AnimalDetail'>

export function useAnimalDetailController(navigation: Navigation, route: Route) {
  const { animalId } = route.params
  const { animals } = useAnimalStore()
  const animal = animals.find(a => a.id === animalId)

  const { careEvents } = useCareStore()
  const { healthRecords, fetchByAnimal: fetchHealth } = useHealthStore()
  const { animalBreedings, fetchByAnimal: fetchBreeding } = useBreedingStore()
  const { notes, fetchByAnimal: fetchNotes } = useNoteStore()
  const { weightLogs, fetchByAnimal: fetchWeight } = useWeightStore()

  const [activeTab, setActiveTab] = useState<AnimalTab>('timeline')

  useEffect(() => {
    fetchHealth(animalId)
    fetchBreeding(animalId)
    fetchNotes(animalId)
    fetchWeight(animalId)
  }, [animalId])

  const animalCareEvents = careEvents.filter(e => e.animalId === animalId)
  const activeWithdrawals = getActiveWithdrawals(healthRecords)

  const age = calculateAnimalAge(animal?.birthday ?? '')

  const onBack = () => navigation.goBack()
  const onEdit = () => navigation.navigate('EditAnimal', { animalId })
  const onAddCare = () => navigation.navigate('CreateCareEvent', { animalId })
  const onAddHealth = () => navigation.navigate('CreateHealthRecord', { animalId })
  const onAddBreeding = () => navigation.navigate('CreateBreedingRecord', { animalId })
  const onAddNote = () => navigation.navigate('CreateNote', { animalId })
  const onAddWeight = () => navigation.navigate('CreateWeightLog', { animalId })

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
    breedingRecords: animalBreedings,
    notes,
    weightLogs,
    onBack,
    onEdit,
    onAddCare,
    onAddHealth,
    onAddBreeding,
    onAddNote,
    onAddWeight,
    getFabAction,
  }
}
