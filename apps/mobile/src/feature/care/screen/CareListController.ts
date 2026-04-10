import { useState, useMemo } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCareStore } from '../../../store/careStore'
import { useAnimalStore } from '../../../store/animalStore'
import { getCareStatus } from '../../../util/CareUtility'
import CareEvent from '../../../schema/care/CareEvent'
import { bsCareService } from '../../../Bootstrap'

type Navigation = NativeStackNavigationProp<RootStackParamList>

export function useCareListController(navigation: Navigation) {
  const { careEvents, loading } = useCareStore()
  const { animals } = useAnimalStore()
  const [filterAnimalId, setFilterAnimalId] = useState<string | null>(null)

  const incompleteEvents = useMemo(
    () => careEvents.filter(e => !e.completedDate),
    [careEvents]
  )

  const filteredEvents = useMemo(
    () => filterAnimalId
      ? incompleteEvents.filter(e => e.animalId === filterAnimalId)
      : incompleteEvents,
    [incompleteEvents, filterAnimalId]
  )

  const overdue = useMemo(
    () => filteredEvents.filter(e => getCareStatus(e.dueDate).status === 'OVERDUE'),
    [filteredEvents]
  )

  const dueToday = useMemo(
    () => filteredEvents.filter(e => getCareStatus(e.dueDate).status === 'DUE_TODAY'),
    [filteredEvents]
  )

  const upcoming = useMemo(
    () => filteredEvents.filter(e => getCareStatus(e.dueDate).status === 'UPCOMING'),
    [filteredEvents]
  )

  const future = useMemo(
    () => filteredEvents.filter(e => getCareStatus(e.dueDate).status === 'FUTURE'),
    [filteredEvents]
  )

  const getAnimalName = (animalId: string) => animals.find(a => a.id === animalId)?.name ?? ''

  const onEventPress = (eventId: string) => navigation.navigate('CareEventDetail', { eventId })
  const onCreateEvent = () => navigation.navigate('CreateCareEvent', { animalId: filterAnimalId ?? '' })

  const onComplete = async (event: CareEvent) => {
    await bsCareService.completeCareEvent(event)
  }

  return {
    overdue, dueToday, upcoming, future, loading,
    animals, filterAnimalId, setFilterAnimalId, getAnimalName,
    onEventPress, onCreateEvent, onComplete,
  }
}
