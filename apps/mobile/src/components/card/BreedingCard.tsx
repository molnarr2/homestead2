import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'

interface Props {
  damName: string
  expectedDueDate: string
  daysRemaining: number
  progressPercent: number
  label: string
  onPress: () => void
}

const BreedingCard: React.FC<Props> = ({
  damName,
  expectedDueDate,
  daysRemaining,
  progressPercent,
  label,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-surface rounded-lg p-3 mb-2"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-base font-medium text-text-primary">{damName}</Text>
          <Text className="text-sm text-text-secondary mt-0.5">Due {expectedDueDate}</Text>
        </View>
        <View className="items-end">
          <Text className="text-xs font-semibold text-primary">
            {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
          </Text>
          <Icon name="chevron-right" size={18} color="#9CA3AF" />
        </View>
      </View>
      <View className="h-2 bg-border-light rounded-full overflow-hidden">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </View>
      <Text className="text-xs text-text-secondary mt-1 capitalize">
        {Math.round(progressPercent)}% {label}
      </Text>
    </TouchableOpacity>
  )
}

export default BreedingCard
