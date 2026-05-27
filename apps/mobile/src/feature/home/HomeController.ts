import { useState, useMemo } from 'react'
import { useUserStore } from '../../store/userStore'
import { useCareStore } from '../../store/careStore'
import { useBreedingStore } from '../../store/breedingStore'
import { useHealthStore } from '../../store/healthStore'
import { useAnimalStore } from '../../store/animalStore'
import { useHomesteadStore } from '../../store/homesteadStore'
import { usePaywallStore } from '../../store/paywallStore'
import { effectiveSubscription } from '../subscription/service/ISubscriptionService'
import { getCareStatus, getDaysOverdue } from '../../util/CareUtility'
import { calculateWithdrawal } from '../../util/WithdrawalUtility'
import { calculateGestation, GestationStatus } from '../../util/GestationUtility'
import { formatDate } from '../../util/DateUtility'
import { tstampToDateOrNow } from '../../schema/type/Tstamp'
import { startOfDay, differenceInDays, startOfToday } from 'date-fns'
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

export interface FarmSummaryItem {
  animalType: string
  count: number
}

export interface UpcomingEventItem {
  label: string
  animalName: string
  daysUntil: number
  type: 'care' | 'breeding'
}

export function useHomeController(navigation: any) {
  const user = useUserStore(s => s.user)
  const careEvents = useCareStore(s => s.careEvents)
  const breedingRecords = useBreedingStore(s => s.breedingRecords)
  const healthRecords = useHealthStore(s => s.healthRecords)
  const animals = useAnimalStore(s => s.animals)
  const homestead = useHomesteadStore(s => s.homestead)
  const [refreshing, setRefreshing] = useState(false)

  const animalMap = useMemo(() => {
    const map = new Map<string, { name: string; animalType: string }>()
    for (const animal of animals) {
      map.set(animal.id, { name: animal.name, animalType: animal.animalType })
    }
    return map
  }, [animals])

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
    for (const record of healthRecords) {
      const animalName = animalMap.get(record.animalId)?.name ?? ''
      if (record.medicationWithdrawalDays > 0) {
        const result = calculateWithdrawal(
          record.date, record.medicationWithdrawalDays, record.medicationWithdrawalType, record.name
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
  }, [healthRecords, animalMap])

  const breedingCountdowns: DashboardBreedingItem[] = useMemo(() => {
    return breedingRecords
      .filter(record => record.status === 'active')
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
  }, [breedingRecords, animalMap])

  const farmSummary: FarmSummaryItem[] = useMemo(() => {
    const counts = new Map<string, number>()
    for (const animal of animals) {
      if (animal.state !== 'own') continue
      counts.set(animal.animalType, (counts.get(animal.animalType) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([animalType, count]) => ({ animalType, count }))
      .sort((a, b) => b.count - a.count)
  }, [animals])

  const allUpcomingEvents: UpcomingEventItem[] = useMemo(() => {
    const items: UpcomingEventItem[] = []

    for (const event of careEvents) {
      if (event.completedDate !== null) continue
      const status = getCareStatus(event.dueDate)
      if (status.status !== 'UPCOMING') continue
      const dueDate = tstampToDateOrNow(event.dueDate)
      const daysUntil = differenceInDays(startOfDay(dueDate), startOfToday())
      items.push({
        label: event.name,
        animalName: animalMap.get(event.animalId)?.name ?? '',
        daysUntil,
        type: 'care',
      })
    }

    for (const record of breedingRecords) {
      if (record.status !== 'active') continue
      const animal = animalMap.get(record.animalId)
      const gestation = calculateGestation(record.breedingDate, animal?.animalType ?? '')
      if (gestation.daysRemaining <= 7 && !gestation.isOverdue) {
        items.push({
          label: gestation.label,
          animalName: animal?.name ?? '',
          daysUntil: gestation.daysRemaining,
          type: 'breeding',
        })
      }
    }

    return items.sort((a, b) => a.daysUntil - b.daysUntil)
  }, [careEvents, breedingRecords, animalMap])

  const overdueEventsDisplay = useMemo(() => overdueEvents.slice(0, 5), [overdueEvents])
  const overdueEventsTotal = overdueEvents.length

  const dueTodayEventsDisplay = useMemo(() => dueTodayEvents.slice(0, 5), [dueTodayEvents])
  const dueTodayEventsTotal = dueTodayEvents.length

  const activeWithdrawalsDisplay = useMemo(() => activeWithdrawals.slice(0, 5), [activeWithdrawals])
  const activeWithdrawalsTotal = activeWithdrawals.length

  const breedingCountdownsDisplay = useMemo(() => breedingCountdowns.slice(0, 5), [breedingCountdowns])
  const breedingCountdownsTotal = breedingCountdowns.length

  const upcomingEvents = useMemo(() => allUpcomingEvents.slice(0, 5), [allUpcomingEvents])
  const upcomingEventsTotal = allUpcomingEvents.length

  const onRefresh = async () => {
    setRefreshing(true)
    setRefreshing(false)
  }

  const onCareEventPress = (eventId: string) =>
    navigation.navigate('CareEventDetail', { eventId })
  const onAnimalPress = (animalId: string) =>
    navigation.navigate('AnimalDetail', { animalId })
  const onBreedingPress = (recordId: string) =>
    navigation.navigate('BreedingRecordDetail', { recordId })

  const FREE_TIER_ANIMAL_LIMIT = 12
  const STANDARD_TIER_ANIMAL_LIMIT = 50
  const onQuickAddAnimal = () => {
    const tier = effectiveSubscription(homestead)
    const count = animals.length
    if (
      (tier === 'free' && count >= FREE_TIER_ANIMAL_LIMIT) ||
      (tier === 'standard' && count >= STANDARD_TIER_ANIMAL_LIMIT)
    ) {
      usePaywallStore.getState().show()
      return
    }
    navigation.navigate('CreateAnimal', {})
  }
  const onQuickRecordCare = () =>
    navigation.navigate('Care')
  const onAnimalTypePress = () =>
    navigation.navigate('Animals')

  const onViewOverdue = () =>
    navigation.navigate('HomeFullList', { listType: 'overdue' as const })
  const onViewDueToday = () =>
    navigation.navigate('HomeFullList', { listType: 'dueToday' as const })
  const onViewUpcoming = () =>
    navigation.navigate('HomeFullList', { listType: 'upcoming' as const })
  const onViewBreeding = () =>
    navigation.navigate('HomeFullList', { listType: 'breeding' as const })
  const onViewWithdrawals = () =>
    navigation.navigate('HomeFullList', { listType: 'withdrawals' as const })

  const onOpenDrawer = () => {
    const parent = navigation.getParent()
    if (parent && 'openDrawer' in parent) {
      ;(parent as any).openDrawer()
    }
  }

  const getGreeting = (): string => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return {
    user,
    greeting: getGreeting(),
    overdueEvents: overdueEventsDisplay,
    overdueEventsTotal,
    dueTodayEvents: dueTodayEventsDisplay,
    dueTodayEventsTotal,
    activeWithdrawals: activeWithdrawalsDisplay,
    activeWithdrawalsTotal,
    breedingCountdowns: breedingCountdownsDisplay,
    breedingCountdownsTotal,
    farmSummary,
    upcomingEvents,
    upcomingEventsTotal,
    refreshing,
    onRefresh,
    onCareEventPress,
    onAnimalPress,
    onBreedingPress,
    onQuickAddAnimal,
    onQuickRecordCare,
    onAnimalTypePress,
    onOpenDrawer,
    onViewOverdue,
    onViewDueToday,
    onViewUpcoming,
    onViewBreeding,
    onViewWithdrawals,
  }
}
