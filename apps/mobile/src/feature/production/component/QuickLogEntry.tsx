import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import { ProductionType } from '../../../schema/production/ProductionLog'

const QUICK_TYPES: { type: ProductionType; icon: string; label: string }[] = [
  { type: 'eggs', icon: 'egg', label: 'Eggs' },
  { type: 'milk', icon: 'cup', label: 'Milk' },
  { type: 'fiber', icon: 'sheep', label: 'Fiber' },
  { type: 'honey', icon: 'bee', label: 'Honey' },
  { type: 'meat', icon: 'food-steak', label: 'Meat' },
]

interface Props {
  onSelect: (type: ProductionType) => void
}

const QuickLogEntry: React.FC<Props> = ({ onSelect }) => {
  return (
    <View className="flex-row justify-around py-3">
      {QUICK_TYPES.map(item => (
        <TouchableOpacity
          key={item.type}
          className="items-center"
          onPress={() => onSelect(item.type)}
          activeOpacity={0.7}
        >
          <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
            <Icon name={item.icon as React.ComponentProps<typeof Icon>['name']} size={24} color="#4A6741" />
          </View>
          <Text className="text-xs text-text-secondary mt-1">{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default QuickLogEntry
