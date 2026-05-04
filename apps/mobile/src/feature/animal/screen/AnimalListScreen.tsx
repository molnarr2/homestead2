import React, { useState } from 'react'
import { View, Text, SectionList, TouchableOpacity, ActivityIndicator } from 'react-native'
import TurboImage from 'react-native-turbo-image'
import Icon from '@react-native-vector-icons/material-design-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalListController } from './AnimalListController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import SearchBar from '../../../components/input/SearchBar'
import FloatingActionButton from '../../../components/button/FloatingActionButton'
import EmptyState from '../../../components/layout/EmptyState'
import AnimalListByType from '../component/AnimalListByType'
import AnimalFilterModal from '../component/AnimalFilterModal'
import Animal from '../../../schema/animal/Animal'

type Navigation = NativeStackNavigationProp<RootStackParamList>

const AnimalListScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const controller = useAnimalListController(navigation)
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

  return (
    <ScreenContainer>
      <View className="flex-1">
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xl font-bold text-text-primary">Animals</Text>
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
          <SearchBar
            value={controller.searchQuery}
            onChangeText={controller.setSearchQuery}
            placeholder="Search by name or breed..."
          />
        </View>

        {controller.sections.length === 0 ? (
          <EmptyState
            icon="cow"
            title="No animals yet"
            subtitle="Add your first animal to get started!"
          />
        ) : (
          <SectionList
            sections={controller.sections}
            keyExtractor={(item: Animal) => item.id}
            renderSectionHeader={({ section }) => (
              <AnimalListByType title={section.title} count={section.data.length} />
            )}
            renderItem={({ item }) => (
              <AnimalCard animal={item} onPress={() => controller.onAnimalPress(item.id)} />
            )}
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />
        )}

        <FloatingActionButton onPress={controller.onCreateAnimal} />

        <AnimalFilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          animalTypes={controller.animalTypes}
          selectedTypes={controller.filterTypes}
          onTypesChange={controller.setFilterTypes}
          selectedStates={controller.filterStates}
          onStatesChange={controller.setFilterStates}
          onReset={controller.resetFilters}
        />
      </View>
    </ScreenContainer>
  )
}

interface AnimalCardProps {
  animal: Animal
  onPress: () => void
}

const STATE_BADGE_COLORS: Record<string, string> = {
  own: 'bg-status-success',
  sold: 'bg-status-info',
  deceased: 'bg-status-error',
  processed: 'bg-status-warning',
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onPress }) => {
  return (
    <TouchableOpacity
      className="mx-4 mb-2 bg-surface rounded-xl p-3 flex-row items-center border border-border-light"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 rounded-full bg-backgroundDark items-center justify-center mr-3 overflow-hidden">
        {animal.photoUrl ? (
          <TurboImage
            source={{ uri: animal.photoUrl }}
            style={{ width: 48, height: 48, borderRadius: 24 }}
            cachePolicy="dataCache"
          />
        ) : (
          <Text className="text-lg font-semibold text-text-secondary">{animal.name.charAt(0)}</Text>
        )}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-text-primary">{animal.name}</Text>
        <Text className="text-sm text-text-secondary">
          {animal.breed || animal.animalType}{animal.birthday ? ` \u00B7 ${animal.birthday.substring(0, 4)}` : ''}
        </Text>
      </View>
      <View className={`px-2 py-0.5 rounded-full ${STATE_BADGE_COLORS[animal.state] || 'bg-primary'}`}>
        <Text className="text-xs font-bold text-text-inverse capitalize">{animal.state}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default AnimalListScreen
