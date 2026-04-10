import React from 'react'
import { View, Text } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalDetailController } from './AnimalDetailController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import AnimalDetailHeader from '../component/AnimalDetailHeader'
import AnimalDetailTabs from '../component/AnimalDetailTabs'
import AnimalTimelineTab from '../component/AnimalTimelineTab'
import AnimalHealthTab from '../component/AnimalHealthTab'
import AnimalBreedingTab from '../component/AnimalBreedingTab'
import AnimalCareTab from '../component/AnimalCareTab'
import AnimalNotesTab from '../component/AnimalNotesTab'
import AnimalWeightTab from '../component/AnimalWeightTab'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'AnimalDetail'>
type Route = RouteProp<RootStackParamList, 'AnimalDetail'>

const AnimalDetailScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const controller = useAnimalDetailController(navigation, route)

  if (!controller.animal) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-text-secondary">Animal not found</Text>
        </View>
      </ScreenContainer>
    )
  }

  const renderActiveTab = () => {
    switch (controller.activeTab) {
      case 'timeline':
        return (
          <AnimalTimelineTab
            careEvents={controller.careEvents}
            healthRecords={controller.healthRecords}
            breedingRecords={controller.breedingRecords}
            notes={controller.notes}
            weightLogs={controller.weightLogs}
          />
        )
      case 'health':
        return (
          <AnimalHealthTab
            healthRecords={controller.healthRecords}
            activeWithdrawals={controller.activeWithdrawals}
            onAddHealth={controller.onAddHealth}
          />
        )
      case 'breeding':
        return (
          <AnimalBreedingTab
            breedingRecords={controller.breedingRecords}
            onAddBreeding={controller.onAddBreeding}
          />
        )
      case 'care':
        return (
          <AnimalCareTab
            careEvents={controller.careEvents}
            onAddCare={controller.onAddCare}
          />
        )
      case 'notes':
        return (
          <AnimalNotesTab
            notes={controller.notes}
            onAddNote={controller.onAddNote}
          />
        )
      case 'weight':
        return (
          <AnimalWeightTab
            weightLogs={controller.weightLogs}
            onAddWeight={controller.onAddWeight}
          />
        )
    }
  }

  return (
    <ScreenContainer>
      <AnimalDetailHeader
        animal={controller.animal}
        age={controller.age}
        onEdit={controller.onEdit}
        onBack={controller.onBack}
      />

      {controller.activeWithdrawals.length > 0 ? (
        <View className="flex-row items-center px-4 py-2 bg-status-error/10">
          <Icon name="alert-circle" size={16} color="#E53935" />
          <Text className="text-xs font-semibold text-status-error ml-1">
            {controller.activeWithdrawals.length} active withdrawal{controller.activeWithdrawals.length > 1 ? 's' : ''}
          </Text>
        </View>
      ) : null}

      <AnimalDetailTabs
        activeTab={controller.activeTab}
        onTabChange={controller.setActiveTab}
      />

      <View className="flex-1">
        {renderActiveTab()}
      </View>
    </ScreenContainer>
  )
}

export default AnimalDetailScreen
