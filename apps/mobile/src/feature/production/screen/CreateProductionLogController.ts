import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalStore } from '../../../store/animalStore'
import { useUserStore } from '../../../store/userStore'
import { bsProductionService } from '../../../Bootstrap'
import { productionLog_default, ProductionType } from '../../../schema/production/ProductionLog'
import { getDefaultUnit } from '../../../util/ProductionUtility'
import { todayIso } from '../../../util/DateUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateProductionLog'>
type Route = RouteProp<RootStackParamList, 'CreateProductionLog'>

export function useCreateProductionLogController(navigation: Navigation, route: Route) {
  const { animalId: initialAnimalId, groupName: initialGroup, type: initialType } = route.params ?? {}
  const { animals } = useAnimalStore()
  const user = useUserStore(s => s.user)

  const [productionType, setProductionType] = useState<ProductionType>(initialType ?? 'eggs')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState(getDefaultUnit(initialType ?? 'eggs'))
  const [date, setDate] = useState(todayIso().split('T')[0])
  const [animalId, setAnimalId] = useState(initialAnimalId ?? '')
  const [groupName, setGroupName] = useState(initialGroup ?? '')
  const [notes, setNotes] = useState('')
  const [logMode, setLogMode] = useState<'animal' | 'group'>(initialAnimalId ? 'animal' : 'group')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUnit(getDefaultUnit(productionType))
  }, [productionType])

  const submit = async () => {
    const tier = user?.subscription ?? 'free'
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
      animalId: logMode === 'animal' ? animalId : '',
      groupName: logMode === 'group' ? groupName : '',
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
    animalId, setAnimalId,
    groupName, setGroupName,
    notes, setNotes,
    logMode, setLogMode,
    animals, loading, submit, onBack,
  }
}
