import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalStore } from '../../../store/animalStore'
import { useGroupStore } from '../../../store/groupStore'
import { useHomesteadStore } from '../../../store/homesteadStore'
import { effectiveSubscription } from '../../subscription/service/ISubscriptionService'
import { bsProductionService } from '../../../Bootstrap'
import { productionLog_default, ProductionType } from '../../../schema/production/ProductionLog'
import { getDefaultUnit } from '../../../util/ProductionUtility'
import { todayIso } from '../../../util/DateUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateProductionLog'>
type Route = RouteProp<RootStackParamList, 'CreateProductionLog'>

export function useCreateProductionLogController(navigation: Navigation, route: Route) {
  const { animalId: routeAnimalId, groupId: routeGroupId, type: initialType } = route.params ?? {}
  const { animals } = useAnimalStore()
  const { groups } = useGroupStore()
  const homestead = useHomesteadStore(s => s.homestead)

  const [productionType, setProductionType] = useState<ProductionType>(initialType ?? 'eggs')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState(getDefaultUnit(initialType ?? 'eggs'))
  const [date, setDate] = useState(todayIso().split('T')[0])
  const [selectedAnimalId, setSelectedAnimalId] = useState(routeGroupId ? '' : (routeAnimalId ?? ''))
  const [selectedGroupId, setSelectedGroupId] = useState(routeGroupId ?? '')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUnit(getDefaultUnit(productionType))
  }, [productionType])

  const handleSelectAnimal = (animalId: string) => {
    setSelectedAnimalId(animalId)
    setSelectedGroupId('')
  }

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId)
    setSelectedAnimalId('')
  }

  const isReadOnly = !!(routeAnimalId || routeGroupId)
  const selectedAnimal = animals.find(a => a.id === selectedAnimalId) ?? null
  const selectedGroup = groups.find(g => g.id === selectedGroupId) ?? null

  const submit = async () => {
    const tier = effectiveSubscription(homestead)
    if (tier === 'free') {
      Alert.alert(
        'Pro Feature',
        'Production logging is available with a Pro or Farm subscription. Upgrade to track your daily production.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
        ]
      )
      return
    }

    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) return

    setLoading(true)
    const log = {
      ...productionLog_default(),
      productionType,
      quantity: qty,
      unit,
      date,
      notes,
      animalId: selectedAnimalId,
      groupName: selectedGroup?.name ?? '',
    }
    await bsProductionService.createProductionLog(log)
    setLoading(false)
    navigation.goBack()
  }

  const onBack = () => navigation.goBack()

  return {
    productionType, setProductionType,
    quantity, setQuantity,
    unit, setUnit,
    date, setDate,
    selectedAnimalId, handleSelectAnimal,
    selectedGroupId, handleSelectGroup,
    isReadOnly,
    selectedAnimal,
    selectedGroup,
    notes, setNotes,
    animals, loading, submit, onBack,
  }
}
