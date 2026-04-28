import { useState, useMemo } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useProductionStore } from '../../../store/productionStore'
import { ProductionType } from '../../../schema/production/ProductionLog'
import { aggregateProduction } from '../../../util/ProductionUtility'
import { todayIso, daysBetween } from '../../../util/DateUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList>

export function useProductionListController(navigation: Navigation) {
  const { productionLogs, loading } = useProductionStore()
  const [selectedType, setSelectedType] = useState<ProductionType | 'all'>('all')
  const [refreshing, setRefreshing] = useState(false)
  const today = todayIso()

  const filteredLogs = useMemo(
    () => selectedType === 'all'
      ? productionLogs
      : productionLogs.filter(l => l.productionType === selectedType),
    [productionLogs, selectedType]
  )

  const dailySummary = useMemo(
    () => aggregateProduction(filteredLogs, today),
    [filteredLogs, today]
  )

  const recentLogs = useMemo(
    () => filteredLogs
      .filter(l => daysBetween(l.date, today) <= 7)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [filteredLogs, today]
  )

  const onCreateLog = (type?: ProductionType) =>
    navigation.navigate('CreateProductionLog', { type })

  const onRefresh = async () => {
    setRefreshing(true)
    setRefreshing(false)
  }

  return {
    productionLogs,
    filteredLogs,
    dailySummary,
    recentLogs,
    selectedType,
    setSelectedType,
    loading,
    refreshing,
    onRefresh,
    onCreateLog,
    today,
  }
}
