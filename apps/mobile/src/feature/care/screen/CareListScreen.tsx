import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCareListController } from './CareListController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import FloatingActionButton from '../../../components/button/FloatingActionButton'
import EmptyState from '../../../components/layout/EmptyState'
import CareEventsByStatus from '../component/CareEventsByStatus'
import CareFilterModal from '../component/CareFilterModal'

type Navigation = NativeStackNavigationProp<RootStackParamList>

const CareListScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const controller = useCareListController(navigation)
  const [filterModalVisible, setFilterModalVisible] = useState(false)

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
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xl font-bold text-text-primary">Care Schedule</Text>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(true)}
              activeOpacity={0.7}
              className="p-1"
            >
              <View>
                <Icon name="filter-variant" size={24} color="#1A1A1A" />
                {controller.isFilterActive ? (
                  <View className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary" />
                ) : null}
              </View>
            </TouchableOpacity>
          </View>
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

        <CareFilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          animalTypes={controller.animalTypes}
          selectedType={controller.filterType}
          onTypeChange={controller.setFilterType}
          onReset={controller.resetFilters}
        />
      </View>
    </ScreenContainer>
  )
}

export default CareListScreen
