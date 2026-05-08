import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useProductionStore } from '../../../store/productionStore'
import { useAnimalStore } from '../../../store/animalStore'
import { bsProductionService } from '../../../Bootstrap'
import { ProductionType } from '../../../schema/production/ProductionLog'
import { getDefaultUnit } from '../../../util/ProductionUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditProductionLog'>
type Route = RouteProp<RootStackParamList, 'EditProductionLog'>

export function useEditProductionLogController(navigation: Navigation, route: Route) {
  const { logId } = route.params
  const log = useProductionStore(s => s.productionLogs.find(l => l.id === logId))
  const { animals } = useAnimalStore()

  const [productionType, setProductionType] = useState<ProductionType>(log?.productionType ?? 'eggs')
  const [quantity, setQuantity] = useState(log ? String(log.quantity) : '')
  const [unit, setUnit] = useState(log?.unit ?? getDefaultUnit('eggs'))
  const [date, setDate] = useState(log?.date ?? '')
  const [animalId, setAnimalId] = useState(log?.animalId ?? '')
  const [groupName, setGroupName] = useState(log?.groupName ?? '')
  const [notes, setNotes] = useState(log?.notes ?? '')
  const [logMode, setLogMode] = useState<'animal' | 'group'>(log?.animalId ? 'animal' : 'group')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUnit(getDefaultUnit(productionType))
  }, [productionType])

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
      animalId: logMode === 'animal' ? animalId : '',
      groupName: logMode === 'group' ? groupName : '',
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
