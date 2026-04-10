import React from 'react'
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useProductionListController } from './ProductionListController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import FloatingActionButton from '../../../components/button/FloatingActionButton'
import EmptyState from '../../../components/layout/EmptyState'
import QuickLogEntry from '../component/QuickLogEntry'
import ProductionSummaryCard from '../component/ProductionSummaryCard'
import ProductionTrendChart from '../component/ProductionTrendChart'
import ProductionTypeSelector from '../component/ProductionTypeSelector'
import ProductionLog from '../../../schema/production/ProductionLog'
import Icon from '@react-native-vector-icons/material-design-icons'
import { formatDate } from '../../../util/DateUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList>

const TYPE_ICONS: Record<string, string> = {
  eggs: 'egg',
  milk: 'cup',
  fiber: 'sheep',
  honey: 'bee',
  meat: 'food-steak',
  other: 'package-variant',
}

const ProductionCard: React.FC<{ log: ProductionLog }> = ({ log }) => {
  const iconName = TYPE_ICONS[log.productionType] ?? 'package-variant'
  return (
    <View className="bg-surface rounded-xl p-4 border border-border-light mb-2 flex-row items-center">
      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
        <Icon name={iconName as React.ComponentProps<typeof Icon>['name']} size={20} color="#4A6741" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-text-primary">
          {log.quantity} {log.unit}
        </Text>
        <Text className="text-sm text-text-secondary">
          {log.productionType.charAt(0).toUpperCase() + log.productionType.slice(1)}
          {log.animalId ? '' : log.groupName ? ` · ${log.groupName}` : ''}
        </Text>
      </View>
      <Text className="text-xs text-text-secondary">{formatDate(log.date)}</Text>
    </View>
  )
}

const ProductionListScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const c = useProductionListController(navigation)

  if (c.loading && c.productionLogs.length === 0) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A6741" />
        </View>
      </ScreenContainer>
    )
  }

  const isEmpty = c.productionLogs.length === 0

  return (
    <ScreenContainer>
      <View className="flex-1">
        <FlatList
          data={c.recentLogs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ProductionCard log={item} />}
          refreshControl={
            <RefreshControl refreshing={c.refreshing} onRefresh={c.onRefresh} tintColor="#4A6741" />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          ListHeaderComponent={
            <View>
              <Text className="text-2xl font-bold text-text-primary pt-4 pb-2">Production</Text>

              <QuickLogEntry onSelect={type => c.onCreateLog(type)} />

              <View className="mb-3">
                <ProductionSummaryCard summary={c.dailySummary} />
              </View>

              {c.filteredLogs.length > 0 && (
                <View className="mb-3">
                  <ProductionTrendChart logs={c.filteredLogs} days={30} referenceDate={c.today} />
                </View>
              )}

              <View className="mb-3">
                <ProductionTypeSelector
                  selected={c.selectedType}
                  onSelect={c.setSelectedType}
                />
              </View>

              {c.recentLogs.length > 0 && (
                <Text className="text-lg font-semibold text-text-primary mb-2">Recent Logs</Text>
              )}
            </View>
          }
          ListEmptyComponent={
            isEmpty ? (
              <EmptyState
                icon="egg"
                title="No production logged yet"
                subtitle="Start tracking your harvest!"
              />
            ) : (
              <View className="py-4 items-center">
                <Text className="text-sm text-text-secondary">No logs matching this filter</Text>
              </View>
            )
          }
        />

        <FloatingActionButton onPress={() => c.onCreateLog()} />
      </View>
    </ScreenContainer>
  )
}

export default ProductionListScreen
