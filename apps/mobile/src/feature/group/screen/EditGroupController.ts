import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useGroupStore } from '../../../store/groupStore'
import { useAnimalStore } from '../../../store/animalStore'
import { useHomesteadStore } from '../../../store/homesteadStore'
import { effectiveSubscription } from '../../subscription/service/ISubscriptionService'
import { bsGroupService } from '../../../Bootstrap'
import { animalGroup_default } from '../../../schema/animalGroup/AnimalGroup'
import { bsAuthService } from '../../../Bootstrap'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditGroup'>
type Route = RouteProp<RootStackParamList, 'EditGroup'>

const FREE_TIER_GROUP_LIMIT = 10
const PRO_TIER_GROUP_LIMIT = 25

export function useEditGroupController(navigation: Navigation, route: Route) {
  const groupId = route.params?.groupId
  const isEditing = !!groupId
  const { groups } = useGroupStore()
  const { animals } = useAnimalStore()
  const homestead = useHomesteadStore(s => s.homestead)
  const existingGroup = groups.find(g => g.id === groupId)

  const [name, setName] = useState('')
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<string[]>([])
  const [photoUri, setPhotoUri] = useState('')
  const [loading, setLoading] = useState(false)
  const [memberPickerVisible, setMemberPickerVisible] = useState(false)

  useEffect(() => {
    if (existingGroup) {
      setName(existingGroup.name)
      setSelectedAnimalIds(existingGroup.animalIds)
    }
  }, [existingGroup?.id])

  const ownedAnimals = animals.filter(a => a.state === 'own')

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a group name.')
      return
    }

    if (!isEditing) {
      const tier = effectiveSubscription(homestead)
      const limit = tier === 'free' ? FREE_TIER_GROUP_LIMIT : PRO_TIER_GROUP_LIMIT
      if (groups.length >= limit) {
        Alert.alert('Group Limit Reached', `You can create up to ${limit} groups on your current plan.`)
        return
      }
    }

    setLoading(true)

    if (isEditing && existingGroup) {
      const updated = { ...existingGroup, name: name.trim(), animalIds: selectedAnimalIds }
      const result = await bsGroupService.updateGroup(updated, photoUri || undefined)
      setLoading(false)
      if (result.success) {
        navigation.goBack()
      } else {
        Alert.alert('Error', result.error)
      }
    } else {
      const group = {
        ...animalGroup_default(),
        userId: bsAuthService.currentUserId ?? '',
        name: name.trim(),
        animalIds: selectedAnimalIds,
      }
      const result = await bsGroupService.createGroup(group, photoUri || undefined)
      setLoading(false)
      if (result.success) {
        navigation.goBack()
      } else {
        Alert.alert('Error', result.error)
      }
    }
  }

  const toggleAnimal = (animalId: string) => {
    setSelectedAnimalIds(prev =>
      prev.includes(animalId) ? prev.filter(id => id !== animalId) : [...prev, animalId]
    )
  }

  const onBack = () => navigation.goBack()

  const displayPhotoUrl = photoUri || existingGroup?.photoUrl || ''

  return {
    isEditing,
    name,
    setName,
    selectedAnimalIds,
    toggleAnimal,
    photoUri,
    setPhotoUri,
    displayPhotoUrl,
    ownedAnimals,
    loading,
    memberPickerVisible,
    setMemberPickerVisible,
    submit,
    onBack,
  }
}
