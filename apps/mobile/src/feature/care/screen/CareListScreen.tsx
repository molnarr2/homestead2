import React from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCareListController } from './CareListController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import FloatingActionButton from '../../../components/button/FloatingActionButton'
import EmptyState from '../../../components/layout/EmptyState'
import CareFilterBar from '../component/CareFilterBar'
import CareEventsByStatus from '../component/CareEventsByStatus'

type Navigation = NativeStackNavigationProp<RootStackParamList>

const CareListScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const controller = useCareListController(navigation)

  if (controller.loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A6741" />
        </View>
      </ScreenContainer>
    )
  }

  const isEmpty = controller.overdue.length === 0
    && controller.dueToday.length === 0
    && controller.upcoming.length === 0
    && controller.future.length === 0

  return (
    <ScreenContainer>
      <View className="flex-1">
        <View className="px-4 pt-4 pb-2">
          <Text className="text-2xl font-bold text-text-primary mb-3">Care Schedule</Text>
          <CareFilterBar
            animals={controller.animals}
            selectedAnimalId={controller.filterAnimalId}
            onSelect={controller.setFilterAnimalId}
          />
        </View>

        {isEmpty ? (
          <EmptyState
            icon="medical-bag"
            title="No care events scheduled"
            subtitle="Add one to get started."
          />
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
          >
            {controller.overdue.length > 0 && (
              <CareEventsByStatus
                title="Overdue"
                events={controller.overdue}
                statusColor="red"
                getAnimalName={controller.getAnimalName}
                onEventPress={controller.onEventPress}
                onComplete={controller.onComplete}
              />
            )}
            {controller.dueToday.length > 0 && (
              <CareEventsByStatus
                title="Due Today"
                events={controller.dueToday}
                statusColor="amber"
                getAnimalName={controller.getAnimalName}
                onEventPress={controller.onEventPress}
                onComplete={controller.onComplete}
              />
            )}
            {controller.upcoming.length > 0 && (
              <CareEventsByStatus
                title="Upcoming"
                events={controller.upcoming}
                statusColor="green"
                getAnimalName={controller.getAnimalName}
                onEventPress={controller.onEventPress}
                onComplete={controller.onComplete}
              />
            )}
            {controller.future.length > 0 && (
              <CareEventsByStatus
                title="Future"
                events={controller.future}
                statusColor="gray"
                getAnimalName={controller.getAnimalName}
                onEventPress={controller.onEventPress}
                onComplete={controller.onComplete}
              />
            )}
          </ScrollView>
        )}

        <FloatingActionButton onPress={controller.onCreateEvent} />
      </View>
    </ScreenContainer>
  )
}

export default CareListScreen
