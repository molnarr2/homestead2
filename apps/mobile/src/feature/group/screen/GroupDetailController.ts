import { useState, useMemo } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useGroupStore } from '../../../store/groupStore'
import { useAnimalStore } from '../../../store/animalStore'
import { bsGroupService } from '../../../Bootstrap'
import { Alert } from 'react-native'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'GroupDetail'>
type Route = RouteProp<RootStackParamList, 'GroupDetail'>

export type GroupTab = 'members' | 'care' | 'health'

export function useGroupDetailController(navigation: Navigation, route: Route) {
  const { groupId } = route.params
  const { groups, groupCareEvents, groupHealthRecords } = useGroupStore()
  const { animals } = useAnimalStore()

  const group = groups.find(g => g.id === groupId)
  const [activeTab, setActiveTab] = useState<GroupTab>('members')

  const members = useMemo(() => {
    if (!group) return []
    return animals.filter(a => group.animalIds.includes(a.id))
  }, [group, animals])

  const careEvents = groupCareEvents[groupId] ?? []
  const healthRecords = groupHealthRecords[groupId] ?? []

  const onBack = () => navigation.goBack()
  const onEdit = () => navigation.navigate('EditGroup', { groupId })
  const onMemberPress = (animalId: string) => navigation.navigate('AnimalDetail', { animalId })
  const onAddCare = () => navigation.navigate('CreateCareEvent', { animalId: '', templateId: undefined })
  const onAddHealth = () => navigation.navigate('CreateHealthRecord', { animalId: '', recordType: undefined })

  const onDelete = () => {
    Alert.alert('Delete Group', `Are you sure you want to delete "${group?.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await bsGroupService.deleteGroup(groupId)
          navigation.goBack()
        },
      },
    ])
  }

  return {
    group,
    members,
    careEvents,
    healthRecords,
    activeTab,
    setActiveTab,
    onBack,
    onEdit,
    onDelete,
    onMemberPress,
    onAddCare,
    onAddHealth,
  }
}
