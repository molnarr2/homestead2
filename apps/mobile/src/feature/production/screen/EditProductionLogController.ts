import { useState } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useProductionStore } from '../../../store/productionStore'
import { useAnimalStore } from '../../../store/animalStore'
import { useGroupStore } from '../../../store/groupStore'
import { bsProductionService } from '../../../Bootstrap'
import { ProductionType } from '../../../schema/production/ProductionLog'
import { getDefaultUnit } from '../../../util/ProductionUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditProductionLog'>
type Route = RouteProp<RootStackParamList, 'EditProductionLog'>

export function useEditProductionLogController(navigation: Navigation, route: Route) {
  const { logId } = route.params
  const log = useProductionStore(s => s.productionLogs.find(l => l.id === logId))
  const { animals } = useAnimalStore()
  const { groups } = useGroupStore()

  const productionType = log?.productionType ?? 'eggs'
  const unit = getDefaultUnit(productionType)
  const [quantity, setQuantity] = useState(log ? String(log.quantity) : '')
  const [date, setDate] = useState(log?.date ?? '')
  const [notes, setNotes] = useState(log?.notes ?? '')
  const [loading, setLoading] = useState(false)

  const selectedAnimal = animals.find(a => a.id === log?.animalId) ?? null
  const selectedGroup = log?.groupName
    ? groups.find(g => g.name === log.groupName) ?? null
    : null

  const submit = async () => {
    if (!log) return
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) return

    setLoading(true)
    const updated = {
      ...log,
      productionType,
      quantity: qty,
      unit,
      date,
      notes,
    }
    const result = await bsProductionService.updateProductionLog(updated)
    setLoading(false)
    if (result.success) {
      navigation.goBack()
    } else {
      Alert.alert('Error', result.error)
    }
  }

  const onBack = () => navigation.goBack()

  return {
    log,
    productionType,
    quantity, setQuantity,
    unit,
    date, setDate,
    selectedAnimal,
    selectedGroup,
    notes, setNotes,
    loading, submit, onBack,
  }
}
