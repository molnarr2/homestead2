import React, { useState } from 'react'
import { View, Text, SectionList, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import TurboImage from 'react-native-turbo-image'
import Icon from '@react-native-vector-icons/material-design-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalListController, AnimalSection, GridItem } from './AnimalListController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import SearchBar from '../../../components/input/SearchBar'
import SpeedDialFab from '../../../components/button/SpeedDialFab'
import EmptyState from '../../../components/layout/EmptyState'
import AnimalListByType from '../component/AnimalListByType'
import AnimalFilterModal from '../component/AnimalFilterModal'
import Animal from '../../../schema/animal/Animal'
import AnimalGroup from '../../../schema/animalGroup/AnimalGroup'

type Navigation = NativeStackNavigationProp<RootStackParamList>

const AnimalListScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const controller = useAnimalListController(navigation)
  const [filterModalVisible, setFilterModalVisible] = useState(false)

  if (controller.loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#B5653A" />
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
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={controller.toggleViewMode}
                activeOpacity={0.7}
                className="p-1 mr-2"
              >
                <Icon
                  name={controller.viewMode === 'list' ? 'view-grid-outline' : 'view-list'}
                  size={24}
                  color="#2D2420"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(true)}
                activeOpacity={0.7}
                className="p-1"
              >
                <View>
                  <Icon name="filter-variant" size={24} color="#2D2420" />
                  {controller.isFilterActive ? (
                    <View className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary" />
                  ) : null}
                </View>
              </TouchableOpacity>
            </View>
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
        ) : controller.viewMode === 'grid' ? (
          <FlatList
            data={controller.gridFlatData}
            keyExtractor={(item, index) =>
              item.type === 'header' ? `header-${item.title}` : `row-${index}`
            }
            renderItem={({ item }) => {
              if (item.type === 'header') {
                return <AnimalListByType title={item.title} count={item.count} />
              }
              return (
                <View className="flex-row px-4 mb-2" style={{ gap: 8 }}>
                  <AnimalGridCard
                    animal={item.animals[0]}
                    hasWithdrawal={controller.withdrawalAnimalIds.has(item.animals[0].id)}
                    onPress={() => controller.onAnimalPress(item.animals[0].id)}
                  />
                  {item.animals[1] ? (
                    <AnimalGridCard
                      animal={item.animals[1]}
                      hasWithdrawal={controller.withdrawalAnimalIds.has(item.animals[1].id)}
                      onPress={() => controller.onAnimalPress(item.animals[1]!.id)}
                    />
                  ) : (
                    <View style={{ flex: 1 }} />
                  )}
                </View>
              )
            }}
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <SectionList
            sections={controller.sections}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section }) => (
              <AnimalListByType title={section.title} count={section.data.length} />
            )}
            renderItem={({ item, section }) => {
              if ((section as AnimalSection).isGroupSection) {
                const group = item as AnimalGroup
                return <GroupCard group={group} onPress={() => controller.onGroupPress(group.id)} />
              }
              const animal = item as Animal
              return <AnimalCard animal={animal} onPress={() => controller.onAnimalPress(animal.id)} />
            }}
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />
        )}

        <SpeedDialFab
          actions={[
            { label: 'New Group', icon: 'account-group', onPress: () => navigation.navigate('EditGroup', {}) },
            { label: 'New Animal', icon: 'cow', onPress: controller.onCreateAnimal },
          ]}
        />

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

interface GroupCardProps {
  group: AnimalGroup
  onPress: () => void
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onPress }) => {
  return (
    <TouchableOpacity
      className="mx-4 mb-2 bg-surface rounded-xl p-3 flex-row items-center border border-border-light"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 rounded-full bg-backgroundDark items-center justify-center mr-3 overflow-hidden">
        {group.photoUrl ? (
          <TurboImage
            source={{ uri: group.photoUrl }}
            style={{ width: 48, height: 48, borderRadius: 24 }}
            cachePolicy="dataCache"
          />
        ) : (
          <Text className="text-lg font-semibold text-text-secondary">{group.name.charAt(0)}</Text>
        )}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-text-primary">{group.name}</Text>
        <Text className="text-sm text-text-secondary">
          {group.animalIds.length} member{group.animalIds.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <Icon name="chevron-right" size={20} color="#B0A49E" />
    </TouchableOpacity>
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

interface AnimalGridCardProps {
  animal: Animal
  hasWithdrawal: boolean
  onPress: () => void
}

const AnimalGridCard: React.FC<AnimalGridCardProps> = ({ animal, hasWithdrawal, onPress }) => {
  return (
    <TouchableOpacity
      style={{ flex: 1, aspectRatio: 1 }}
      className="rounded-lg overflow-hidden"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {animal.photoUrl ? (
        <TurboImage
          source={{ uri: animal.photoUrl }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          cachePolicy="dataCache"
          resizeMode="cover"
        />
      ) : (
        <View className="absolute w-full h-full bg-backgroundDark items-center justify-center">
          <Text className="text-3xl font-bold text-white">{animal.name.charAt(0)}</Text>
        </View>
      )}
      {hasWithdrawal ? (
        <View className="absolute top-0 left-0 right-0 bg-status-error/80 py-1 px-2 flex-row items-center">
          <Icon name="alert-circle" size={12} color="#FFFFFF" />
          <Text className="text-xs font-bold text-text-inverse ml-1">Withdrawal</Text>
        </View>
      ) : null}
      <View className="absolute bottom-0 left-0 right-0 px-2 pb-2">
        <Text
          className="text-sm font-bold text-white"
          style={{
            textShadowColor: 'rgba(0,0,0,0.7)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
          }}
        >
          {animal.name}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default AnimalListScreen
