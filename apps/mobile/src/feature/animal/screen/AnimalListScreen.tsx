import React from 'react'
import { View, Text, SectionList, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalListController, AnimalStateFilter } from './AnimalListController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import SearchBar from '../../../components/input/SearchBar'
import FloatingActionButton from '../../../components/button/FloatingActionButton'
import EmptyState from '../../../components/layout/EmptyState'
import AnimalListByType from '../component/AnimalListByType'
import Animal from '../../../schema/animal/Animal'

type Navigation = NativeStackNavigationProp<RootStackParamList>

const STATE_FILTERS: { label: string; value: AnimalStateFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Owned', value: 'own' },
  { label: 'Sold', value: 'sold' },
  { label: 'Died', value: 'died' },
  { label: 'Processed', value: 'processed' },
]

const AnimalListScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const controller = useAnimalListController(navigation)

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
            <View className="bg-primary px-3 py-1 rounded-full">
              <Text className="text-sm font-semibold text-text-inverse">{controller.animalCount}</Text>
            </View>
          </View>
          <SearchBar
            value={controller.searchQuery}
            onChangeText={controller.setSearchQuery}
            placeholder="Search by name or breed..."
          />
          <View className="flex-row mt-3 flex-wrap gap-2">
            {STATE_FILTERS.map(filter => {
              const isActive = controller.filterState === filter.value
              return (
                <TouchableOpacity
                  key={filter.value}
                  className={`px-3 py-1.5 rounded-full border ${isActive ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
                  onPress={() => controller.setFilterState(filter.value)}
                  activeOpacity={0.7}
                >
                  <Text className={`text-sm font-medium ${isActive ? 'text-text-inverse' : 'text-text-secondary'}`}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
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
  died: 'bg-status-error',
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
          <Image
            source={{ uri: animal.photoUrl }}
            className="w-12 h-12 rounded-full"
            resizeMode="cover"
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
