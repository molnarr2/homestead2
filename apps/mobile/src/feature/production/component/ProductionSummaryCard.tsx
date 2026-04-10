import React from 'react'
import { View, Text } from 'react-native'
import { ProductionSummary } from '../../../util/ProductionUtility'

interface Props {
  summary: ProductionSummary
}

const ProductionSummaryCard: React.FC<Props> = ({ summary }) => {
  const items: { label: string; value: number }[] = [
    { label: 'Today', value: summary.daily },
    { label: 'This Week', value: summary.weekly },
    { label: 'This Month', value: summary.monthly },
  ]

  return (
    <View className="flex-row gap-2">
      {items.map(item => (
        <View key={item.label} className="flex-1 bg-surface rounded-xl p-3 border border-border-light items-center">
          <Text className="text-2xl font-bold text-primary">{item.value}</Text>
          <Text className="text-xs text-text-secondary mt-1">{summary.unit || '—'}</Text>
          <Text className="text-xs font-medium text-text-primary mt-1">{item.label}</Text>
        </View>
      ))}
    </View>
  )
}

export default ProductionSummaryCard
