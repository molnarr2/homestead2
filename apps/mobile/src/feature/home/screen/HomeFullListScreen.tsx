import React, { useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCareStore } from '../../../store/careStore'
import { useBreedingStore } from '../../../store/breedingStore'
import { useAnimalStore } from '../../../store/animalStore'
import { getCareStatus, getDaysOverdue } from '../../../util/CareUtility'
import { calculateGestation } from '../../../util/GestationUtility'
import { tstampToDateOrNow } from '../../../schema/type/Tstamp'
import { startOfDay, differenceInDays, startOfToday } from 'date-fns'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import CareEventCard from '../../../components/card/CareEventCard'
import UpcomingEventRow from '../component/UpcomingEventRow'
import Icon from '@react-native-vector-icons/material-design-icons'
import type { DashboardCareItem, UpcomingEventItem } from '../HomeController'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'HomeFullList'>
type Route = RouteProp<RootStackParamList, 'HomeFullList'>

const TITLES: Record<string, string> = {
  overdue: 'Overdue',
  dueToday: 'Due Today',
  upcoming: 'Upcoming',
}

function useHomeFullListController() {
  const navigation = useNavigation<Navigation>()
  const { params } = useRoute<Route>()
  const listType = params.listType

  const careEvents = useCareStore(s => s.careEvents)
  const breedingRecords = useBreedingStore(s => s.breedingRecords)
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

  const onCareEventPress = (eventId: string) =>
    navigation.navigate('CareEventDetail', { eventId })
  const onBreedingPress = (recordId: string) =>
    navigation.navigate('BreedingRecordDetail', { recordId })
  const onBack = () => navigation.goBack()

  return {
    listType,
    title: TITLES[listType],
    overdueItems,
    dueTodayItems,
    upcomingItems,
    onCareEventPress,
    onBreedingPress,
    onBack,
  }
}

const HomeFullListScreen: React.FC = () => {
  const controller = useHomeFullListController()

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
