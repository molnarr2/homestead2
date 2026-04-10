import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'

interface Props {
  eventName: string
  animalName: string
  daysInfo: number
  status: 'overdue' | 'dueToday'
  onPress: () => void
}

const BORDER_COLOR = {
  overdue: 'border-l-status-error',
  dueToday: 'border-l-status-warning',
}

const CareEventCard: React.FC<Props> = ({ eventName, animalName, daysInfo, status, onPress }) => {
  const statusLabel = status === 'overdue'
    ? `${daysInfo} day${daysInfo !== 1 ? 's' : ''} overdue`
    : 'Due today'

  const statusColor = status === 'overdue' ? 'text-status-error' : 'text-status-warning'

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-surface rounded-lg border-l-4 ${BORDER_COLOR[status]} p-3 mb-2`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-2">
          <Text className="text-base font-medium text-text-primary">{eventName}</Text>
          <Text className="text-sm text-text-secondary mt-0.5">{animalName}</Text>
        </View>
        <View className="items-end">
          <Text className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</Text>
          <Icon name="chevron-right" size={18} color="#9CA3AF" />
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default CareEventCard
