import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalTypeDetailController } from './AnimalTypeDetailController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import SectionHeader from '../../../components/layout/SectionHeader'
import BreedList from '../component/BreedList'
import CareTemplateList from '../component/CareTemplateList'
import EventTemplateList from '../component/EventTemplateList'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CustomizeAnimalType'>
type Route = RouteProp<RootStackParamList, 'CustomizeAnimalType'>

const AnimalTypeDetailScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const controller = useAnimalTypeDetailController(navigation, route)

  if (controller.loading || !controller.animalType) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A6741" />
        </View>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">{controller.animalType.name}</Text>
        <TouchableOpacity onPress={controller.onEditType} activeOpacity={0.7} className="p-1">
          <Icon name="pencil" size={24} color="#4A6741" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <SectionHeader title="Colors" />
        <View className="flex-row flex-wrap gap-2 mb-4">
          {controller.animalType.colors.length > 0 ? (
            controller.animalType.colors.map(color => (
              <View key={color} className="px-3 py-1.5 rounded-full bg-primaryLight border border-border-light">
                <Text className="text-sm text-text-primary">{color}</Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-text-secondary">No colors configured</Text>
          )}
        </View>

        <BreedList
          breeds={controller.breeds}
          onAdd={controller.onAddBreed}
          onEdit={controller.onEditBreed}
        />

        <CareTemplateList
          templates={controller.careTemplates}
          onAdd={controller.onAddCareTemplate}
          onEdit={controller.onEditCareTemplate}
        />

        <EventTemplateList
          templates={controller.eventTemplates}
          onAdd={controller.onAddEventTemplate}
        />

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  )
}

export default AnimalTypeDetailScreen
