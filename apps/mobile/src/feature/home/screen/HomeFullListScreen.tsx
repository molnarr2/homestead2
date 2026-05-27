import React, { useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCareStore } from '../../../store/careStore'
import { useBreedingStore } from '../../../store/breedingStore'
import { useHealthStore } from '../../../store/healthStore'
import { useAnimalStore } from '../../../store/animalStore'
import { getCareStatus, getDaysOverdue } from '../../../util/CareUtility'
import { calculateWithdrawal } from '../../../util/WithdrawalUtility'
import { calculateGestation, GestationStatus } from '../../../util/GestationUtility'
import { formatDate } from '../../../util/DateUtility'
import { tstampToDateOrNow } from '../../../schema/type/Tstamp'
import { startOfDay, differenceInDays, startOfToday } from 'date-fns'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import CareEventCard from '../../../components/card/CareEventCard'
import BreedingCard from '../../../components/card/BreedingCard'
import DashboardAlertCard from '../../../components/card/DashboardAlertCard'
import UpcomingEventRow from '../component/UpcomingEventRow'
import Icon from '@react-native-vector-icons/material-design-icons'
import type { DashboardCareItem, DashboardBreedingItem, DashboardWithdrawalItem, UpcomingEventItem } from '../HomeController'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'HomeFullList'>
type Route = RouteProp<RootStackParamList, 'HomeFullList'>

const TITLES: Record<string, string> = {
  overdue: 'Overdue',
  dueToday: 'Due Today',
  upcoming: 'Upcoming',
  breeding: 'Upcoming Births',
  withdrawals: 'Active Withdrawals',
}

function useHomeFullListController() {
  const navigation = useNavigation<Navigation>()
  const { params } = useRoute<Route>()
  const listType = params.listType

  const careEvents = useCareStore(s => s.careEvents)
  const breedingRecords = useBreedingStore(s => s.breedingRecords)
  const healthRecords = useHealthStore(s => s.healthRecords)
  const animals = useAnimalStore(s => s.animals)

  const animalMap = useMemo(() => {
    const map = new Map<string, { name: string; animalType: string }>()
    for (const animal of animals) {
      map.set(animal.id, { name: animal.name, animalType: animal.animalType })
    }
    return map
  }, [animals])

  const overdueItems: DashboardCareItem[] = useMemo(() => {
    if (listType !== 'overdue') return []
    return careEvents
      .filter(e => getCareStatus(e.dueDate).status === 'OVERDUE')
      .map(event => ({
        event,
        animalName: animalMap.get(event.animalId)?.name ?? '',
        daysOverdue: getDaysOverdue(event.dueDate),
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
  }, [listType, careEvents, animalMap])

  const dueTodayItems: DashboardCareItem[] = useMemo(() => {
    if (listType !== 'dueToday') return []
    return careEvents
      .filter(e => getCareStatus(e.dueDate).status === 'DUE_TODAY')
      .map(event => ({
        event,
        animalName: animalMap.get(event.animalId)?.name ?? '',
        daysOverdue: 0,
      }))
  }, [listType, careEvents, animalMap])

  const upcomingItems: UpcomingEventItem[] = useMemo(() => {
    if (listType !== 'upcoming') return []
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
  }, [listType, careEvents, breedingRecords, animalMap])

  const breedingItems: DashboardBreedingItem[] = useMemo(() => {
    if (listType !== 'breeding') return []
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
  }, [listType, breedingRecords, animalMap])

  const withdrawalItems: DashboardWithdrawalItem[] = useMemo(() => {
    if (listType !== 'withdrawals') return []
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
  }, [listType, healthRecords, animalMap])

  const onCareEventPress = (eventId: string) =>
    navigation.navigate('CareEventDetail', { eventId })
  const onBreedingPress = (recordId: string) =>
    navigation.navigate('BreedingRecordDetail', { recordId })
  const onAnimalPress = (animalId: string) =>
    navigation.navigate('AnimalDetail', { animalId })
  const onBack = () => navigation.goBack()

  return {
    listType,
    title: TITLES[listType],
    overdueItems,
    dueTodayItems,
    upcomingItems,
    breedingItems,
    withdrawalItems,
    onCareEventPress,
    onBreedingPress,
    onAnimalPress,
    onBack,
  }
}

const HomeFullListScreen: React.FC = () => {
  const controller = useHomeFullListController()

  if (controller.listType === 'withdrawals') {
    return (
      <ScreenContainer>
        <View className="flex-row items-center px-4 pt-4 pb-2">
          <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1 mr-3">
            <Icon name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-primary">{controller.title}</Text>
        </View>
        <FlatList
          data={controller.withdrawalItems}
          keyExtractor={(item, index) => `${item.animalId}-${item.medicationName}-${index}`}
          className="px-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <DashboardAlertCard
              title={item.medicationName}
              subtitle={`${item.animalName} • ${item.withdrawalType}`}
              detail={`${item.daysRemaining} day${item.daysRemaining !== 1 ? 's' : ''} left`}
              icon="pill"
              onPress={() => controller.onAnimalPress(item.animalId)}
            />
          )}
        />
      </ScreenContainer>
    )
  }

  if (controller.listType === 'breeding') {
    return (
      <ScreenContainer>
        <View className="flex-row items-center px-4 pt-4 pb-2">
          <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1 mr-3">
            <Icon name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-primary">{controller.title}</Text>
        </View>
        <FlatList
          data={controller.breedingItems}
          keyExtractor={item => item.record.id}
          className="px-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <BreedingCard
              damName={item.damName}
              expectedDueDate={item.formattedDueDate}
              daysRemaining={item.gestation.daysRemaining}
              progressPercent={item.gestation.progressPercent}
              label={item.gestation.label}
              onPress={() => controller.onBreedingPress(item.record.id)}
            />
          )}
        />
      </ScreenContainer>
    )
  }

  if (controller.listType === 'upcoming') {
    return (
      <ScreenContainer>
        <View className="flex-row items-center px-4 pt-4 pb-2">
          <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1 mr-3">
            <Icon name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-primary">{controller.title}</Text>
        </View>
        <FlatList
          data={controller.upcomingItems}
          keyExtractor={(item, index) => `${item.type}-${item.label}-${item.animalName}-${index}`}
          className="px-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item, index }) => (
            <View className="bg-surface rounded-xl px-3">
              <UpcomingEventRow
                item={item}
                showBorder={index < controller.upcomingItems.length - 1}
              />
            </View>
          )}
        />
      </ScreenContainer>
    )
  }

  const items = controller.listType === 'overdue' ? controller.overdueItems : controller.dueTodayItems
  const status = controller.listType === 'overdue' ? 'overdue' as const : 'dueToday' as const

  return (
    <ScreenContainer>
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1 mr-3">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">{controller.title}</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={item => item.event.id}
        className="px-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <CareEventCard
            eventName={item.event.name}
            animalName={item.animalName}
            daysInfo={item.daysOverdue}
            status={status}
            onPress={() => controller.onCareEventPress(item.event.id)}
          />
        )}
      />
    </ScreenContainer>
  )
}

export default HomeFullListScreen
