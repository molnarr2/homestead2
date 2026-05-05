import { useState, useMemo } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCareStore } from '../../../store/careStore'
import { useAnimalStore } from '../../../store/animalStore'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'
import { getCareStatus } from '../../../util/CareUtility'
import CareEvent from '../../../schema/care/CareEvent'
import { bsCareService } from '../../../Bootstrap'

type Navigation = NativeStackNavigationProp<RootStackParamList>

export function useCareListController(navigation: Navigation) {
  const { careEvents, loading } = useCareStore()
  const { animals } = useAnimalStore()
  const { animalTypes } = useAnimalTypeStore()
  const [filterType, setFilterType] = useState<string | null>(null)

  const isFilterActive = filterType !== null

  const incompleteEvents = useMemo(
    () => careEvents.filter(e => !e.completedDate),
    [careEvents]
  )

  const filteredEvents = useMemo(() => {
    if (!filterType) return incompleteEvents
    const allowedAnimalIds = new Set(
      animals.filter(a => a.animalTypeId === filterType).map(a => a.id)
    )
    return incompleteEvents.filter(e => allowedAnimalIds.has(e.animalId))
  }, [incompleteEvents, filterType, animals])

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
  const onCreateEvent = () => navigation.navigate('CreateCareEvent', { animalId: '' })

  const onComplete = async (event: CareEvent) => {
    await bsCareService.completeCareEvent(event)
  }

  const resetFilters = () => {
    setFilterType(null)
  }

  return {
    overdue, dueToday, upcoming, future, loading,
    animals, getAnimalName,
    onEventPress, onCreateEvent, onComplete,
    animalTypes, filterType, setFilterType, isFilterActive, resetFilters,
  }
}
