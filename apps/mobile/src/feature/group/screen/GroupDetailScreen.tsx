import React from 'react'
import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import TurboImage from 'react-native-turbo-image'
import Icon from '@react-native-vector-icons/material-design-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useGroupDetailController, GroupTab } from './GroupDetailController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import EmptyState from '../../../components/layout/EmptyState'
import AnimalCareTab from '../../animal/component/AnimalCareTab'
import AnimalHealthTab from '../../animal/component/AnimalHealthTab'
import Animal from '../../../schema/animal/Animal'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'GroupDetail'>
type Route = RouteProp<RootStackParamList, 'GroupDetail'>

const TABS: { key: GroupTab; label: string }[] = [
  { key: 'members', label: 'Members' },
  { key: 'care', label: 'Care' },
  { key: 'health', label: 'Health' },
]

const GroupDetailScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const controller = useGroupDetailController(navigation, route)

  if (!controller.group) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-text-secondary">Group not found</Text>
        </View>
      </ScreenContainer>
    )
  }

  const renderTab = () => {
    switch (controller.activeTab) {
      case 'members':
        return (
          <View className="flex-1">
            {controller.members.length === 0 ? (
              <EmptyState icon="cow" title="No members" subtitle="Edit the group to add animals" />
            ) : (
              <FlatList
                data={controller.members}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <MemberRow animal={item} onPress={() => controller.onMemberPress(item.id)} />}
                contentContainerStyle={{ paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )
      case 'care':
        return <AnimalCareTab careEvents={controller.careEvents} onAddCare={controller.onAddCare} />
      case 'health':
        return <AnimalHealthTab healthRecords={controller.healthRecords} activeWithdrawals={[]} onAddHealth={controller.onAddHealth} />
    }
  }

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary flex-1 text-center">{controller.group.name}</Text>
        <TouchableOpacity onPress={controller.onEdit} activeOpacity={0.7} className="p-1">
          <Icon name="pencil" size={22} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <View className="items-center py-4">
        <View className="w-20 h-20 rounded-full bg-backgroundDark items-center justify-center overflow-hidden">
          {controller.group.photoUrl ? (
            <TurboImage
              source={{ uri: controller.group.photoUrl }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              cachePolicy="dataCache"
            />
          ) : (
            <Text className="text-2xl font-bold text-text-secondary">{controller.group.name.charAt(0)}</Text>
          )}
        </View>
        <Text className="text-sm text-text-secondary mt-2">
          {controller.members.length} member{controller.members.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View className="bg-surface border-b border-border-light">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          {TABS.map(tab => {
            const isActive = controller.activeTab === tab.key
            return (
              <TouchableOpacity
                key={tab.key}
                className={`px-4 py-3 mr-1 ${isActive ? 'border-b-2 border-b-primary' : ''}`}
                onPress={() => controller.setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <View className="flex-1">
        {renderTab()}
      </View>
    </ScreenContainer>
  )
}

interface MemberRowProps {
  animal: Animal
  onPress: () => void
}

const MemberRow: React.FC<MemberRowProps> = ({ animal, onPress }) => (
  <TouchableOpacity
    className="mx-4 mt-2 bg-surface rounded-lg p-3 flex-row items-center border border-border-light"
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View className="w-10 h-10 rounded-full bg-backgroundDark items-center justify-center mr-3 overflow-hidden">
      {animal.photoUrl ? (
        <TurboImage
          source={{ uri: animal.photoUrl }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
          cachePolicy="dataCache"
        />
      ) : (
        <Text className="text-base font-semibold text-text-secondary">{animal.name.charAt(0)}</Text>
      )}
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-text-primary">{animal.name}</Text>
      <Text className="text-sm text-text-secondary">{animal.breed || animal.animalType}</Text>
    </View>
    <Icon name="chevron-right" size={20} color="#BDBDBD" />
  </TouchableOpacity>
)

export default GroupDetailScreen
