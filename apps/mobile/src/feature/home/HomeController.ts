import { useState, useCallback, useMemo } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useUserStore } from '../../store/userStore'
import { useCareStore } from '../../store/careStore'
import { useBreedingStore } from '../../store/breedingStore'
import { useHealthStore } from '../../store/healthStore'
import { useAnimalStore } from '../../store/animalStore'
import { getCareStatus, getDaysOverdue } from '../../util/CareUtility'
import { calculateWithdrawal, WithdrawalResult } from '../../util/WithdrawalUtility'
import { calculateGestation, GestationStatus } from '../../util/GestationUtility'
import { formatDate } from '../../util/DateUtility'
import CareEvent from '../../schema/care/CareEvent'
import BreedingRecord from '../../schema/breeding/BreedingRecord'

export interface DashboardCareItem {
  event: CareEvent
  animalName: string
  daysOverdue: number
}

export interface DashboardWithdrawalItem {
  animalId: string
  animalName: string
  medicationName: string
  withdrawalType: string
  daysRemaining: number
}

export interface DashboardBreedingItem {
  record: BreedingRecord
  damName: string
  gestation: GestationStatus
  formattedDueDate: string
}

export function useHomeController(navigation: any) {
  const user = useUserStore(s => s.user)
  const careEvents = useCareStore(s => s.careEvents)
  const activeBreedings = useBreedingStore(s => s.activeBreedings)
  const activeWithdrawalRecords = useHealthStore(s => s.withdrawalRecords)
  const fetchActiveWithdrawals = useHealthStore(s => s.fetchAllWithdrawalRecords)
  const animals = useAnimalStore(s => s.animals)
  const [refreshing, setRefreshing] = useState(false)

  const animalMap = useMemo(() => {
    const map = new Map<string, { name: string; animalType: string }>()
    for (const animal of animals) {
      map.set(animal.id, { name: animal.name, animalType: animal.animalType })
    }
    return map
  }, [animals])

  useFocusEffect(
    useCallback(() => {
      fetchActiveWithdrawals()
    }, [])
  )

  const overdueEvents: DashboardCareItem[] = useMemo(() => {
    return careEvents
      .filter(e => getCareStatus(e.dueDate).status === 'OVERDUE')
      .map(event => ({
        event,
        animalName: animalMap.get(event.animalId)?.name ?? '',
        daysOverdue: getDaysOverdue(event.dueDate),
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
  }, [careEvents, animalMap])

  const dueTodayEvents: DashboardCareItem[] = useMemo(() => {
    return careEvents
      .filter(e => getCareStatus(e.dueDate).status === 'DUE_TODAY')
      .map(event => ({
        event,
        animalName: animalMap.get(event.animalId)?.name ?? '',
        daysOverdue: 0,
      }))
  }, [careEvents, animalMap])

  const activeWithdrawals: DashboardWithdrawalItem[] = useMemo(() => {
    const results: DashboardWithdrawalItem[] = []
    for (const record of activeWithdrawalRecords) {
      const animalName = animalMap.get(record.animalId)?.name ?? ''
      if (record.withdrawalPeriodDays > 0) {
        const result = calculateWithdrawal(
          record.date, record.withdrawalPeriodDays, record.withdrawalType, record.name
        )
        if (result.status === 'ACTIVE') {
          results.push({
            animalId: record.animalId,
            animalName,
            medicationName: result.medicationName,
            withdrawalType: result.withdrawalType,
            daysRemaining: result.daysRemaining,
          })
        }
      }
      if (record.dewormingWithdrawalDays > 0) {
        const result = calculateWithdrawal(
          record.date, record.dewormingWithdrawalDays, record.dewormingWithdrawalType, record.name
        )
        if (result.status === 'ACTIVE') {
          results.push({
            animalId: record.animalId,
            animalName,
            medicationName: result.medicationName,
            withdrawalType: result.withdrawalType,
            daysRemaining: result.daysRemaining,
          })
        }
      }
    }
    return results.sort((a, b) => a.daysRemaining - b.daysRemaining)
  }, [activeWithdrawalRecords, animalMap])

  const breedingCountdowns: DashboardBreedingItem[] = useMemo(() => {
    return activeBreedings
      .map(record => {
        const animal = animalMap.get(record.animalId)
        const gestation = calculateGestation(record.breedingDate, animal?.animalType ?? '')
        return {
          record,
          damName: animal?.name ?? '',
          gestation,
          formattedDueDate: formatDate(gestation.expectedDueDate),
        }
      })
      .sort((a, b) => a.gestation.daysRemaining - b.gestation.daysRemaining)
  }, [activeBreedings, animalMap])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchActiveWithdrawals()
    setRefreshing(false)
  }

  const onCareEventPress = (eventId: string) =>
    navigation.navigate('CareEventDetail', { eventId })
  const onAnimalPress = (animalId: string) =>
    navigation.navigate('AnimalDetail', { animalId })
  const onBreedingPress = (recordId: string) =>
    navigation.navigate('BreedingRecordDetail', { recordId })

  const getGreeting = (): string => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return {
    user,
    greeting: getGreeting(),
    overdueEvents,
    dueTodayEvents,
    activeWithdrawals,
    breedingCountdowns,
    refreshing,
    onRefresh,
    onCareEventPress,
    onAnimalPress,
    onBreedingPress,
  }
}
