import { useState, useMemo } from 'react'
import { useUserStore } from '../../store/userStore'
import { useCareStore } from '../../store/careStore'
import { useBreedingStore } from '../../store/breedingStore'
import { useHealthStore } from '../../store/healthStore'
import { useAnimalStore } from '../../store/animalStore'
import { useProductionStore } from '../../store/productionStore'
import { getCareStatus, getDaysOverdue } from '../../util/CareUtility'
import { calculateWithdrawal, WithdrawalResult } from '../../util/WithdrawalUtility'
import { calculateGestation, GestationStatus } from '../../util/GestationUtility'
import { formatDate } from '../../util/DateUtility'
import { tstampToDateOrNow } from '../../schema/type/Tstamp'
import { startOfDay, differenceInDays, subDays, isAfter, startOfToday, isToday as isTodayFn } from 'date-fns'
import CareEvent from '../../schema/care/CareEvent'
import BreedingRecord from '../../schema/breeding/BreedingRecord'
import { ProductionType } from '../../schema/production/ProductionLog'

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

export interface ProductionSnapshotItem {
  productionType: ProductionType
  unit: string
  today: number
  week: number
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
  const productionLogs = useProductionStore(s => s.productionLogs)
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

  const productionSnapshot: ProductionSnapshotItem[] = useMemo(() => {
    const today = startOfToday()
    const weekAgo = subDays(today, 7)
    const groups = new Map<ProductionType, { unit: string; today: number; week: number }>()

    for (const log of productionLogs) {
      if (!log.date) continue
      const logDate = new Date(log.date)
      if (!isAfter(logDate, weekAgo)) continue

      const existing = groups.get(log.productionType) ?? { unit: log.unit, today: 0, week: 0 }
      existing.week += log.quantity
      if (isTodayFn(logDate)) {
        existing.today += log.quantity
      }
      groups.set(log.productionType, existing)
    }

    return Array.from(groups.entries()).map(([productionType, data]) => ({
      productionType,
      unit: data.unit,
      today: data.today,
      week: data.week,
    }))
  }, [productionLogs])

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

  const onQuickLogProduction = () =>
    navigation.navigate('CreateProductionLog', {})
  const onQuickAddAnimal = () =>
    navigation.navigate('CreateAnimal', {})
  const onQuickRecordCare = () =>
    navigation.navigate('Care')
  const onQuickAddWeight = () =>
    navigation.navigate('Animals')
  const onAnimalTypePress = () =>
    navigation.navigate('Animals')

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
    overdueEvents,
    dueTodayEvents,
    activeWithdrawals,
    breedingCountdowns,
    farmSummary,
    productionSnapshot,
    upcomingEvents,
    upcomingEventsTotal,
    refreshing,
    onRefresh,
    onCareEventPress,
    onAnimalPress,
    onBreedingPress,
    onQuickLogProduction,
    onQuickAddAnimal,
    onQuickRecordCare,
    onQuickAddWeight,
    onAnimalTypePress,
    onOpenDrawer,
  }
}
