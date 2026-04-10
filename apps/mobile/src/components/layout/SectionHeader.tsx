import React from 'react'
import { View, Text } from 'react-native'

interface Props {
  title: string
  count?: number
  variant?: 'red' | 'amber' | 'default'
}

const BADGE_COLORS: Record<string, string> = {
  red: 'bg-status-error',
  amber: 'bg-status-warning',
  default: 'bg-primary',
}

const SectionHeader: React.FC<Props> = ({ title, count, variant = 'default' }) => {
  return (
    <View className="flex-row items-center mt-4 mb-2">
      <Text className="text-lg font-semibold text-text-primary">{title}</Text>
      {count !== undefined && count > 0 && (
        <View className={`ml-2 px-2 py-0.5 rounded-full ${BADGE_COLORS[variant]}`}>
          <Text className="text-xs font-bold text-text-inverse">{count}</Text>
        </View>
      )}
    </View>
  )
}

export default SectionHeader
