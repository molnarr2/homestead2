import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { ProductionType } from '../../../schema/production/ProductionLog'

const TYPES: { value: ProductionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'milk', label: 'Milk' },
  { value: 'fiber', label: 'Fiber' },
  { value: 'honey', label: 'Honey' },
  { value: 'meat', label: 'Meat' },
  { value: 'other', label: 'Other' },
]

interface Props {
  selected: ProductionType | 'all'
  onSelect: (type: ProductionType | 'all') => void
  showAll?: boolean
}

const ProductionTypeSelector: React.FC<Props> = ({ selected, onSelect, showAll = true }) => {
  const items = showAll ? TYPES : TYPES.filter(t => t.value !== 'all')

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-2">
        {items.map(t => (
          <TouchableOpacity
            key={t.value}
            className={`px-4 py-2 rounded-full border ${
              selected === t.value ? 'bg-primary border-primary' : 'bg-surface border-border-light'
            }`}
            onPress={() => onSelect(t.value)}
            activeOpacity={0.7}
          >
            <Text className={`text-sm font-medium ${
              selected === t.value ? 'text-text-inverse' : 'text-text-primary'
            }`}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

export default ProductionTypeSelector
