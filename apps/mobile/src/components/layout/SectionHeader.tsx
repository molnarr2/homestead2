import React from 'react'
import { View, Text, Pressable } from 'react-native'

interface Props {
  title: string
  count?: number
  variant?: 'red' | 'amber' | 'default'
  onCountPress?: () => void
}

const BADGE_COLORS: Record<string, string> = {
  red: 'bg-status-error',
  amber: 'bg-status-warning',
  default: 'bg-primary',
}

const SectionHeader: React.FC<Props> = ({ title, count, variant = 'default', onCountPress }) => {
  const badge = count !== undefined && count > 0 ? (
    <View className={`ml-2 px-2 py-0.5 rounded-full ${BADGE_COLORS[variant]}`}>
      <Text className="text-xs font-bold text-text-inverse">{count}</Text>
    </View>
  ) : null

  return (
    <View className="flex-row items-center mt-4 mb-2">
      <Text className="text-lg font-semibold text-text-primary">{title}</Text>
      {onCountPress && badge ? (
        <Pressable onPress={onCountPress}>{badge}</Pressable>
      ) : badge}
    </View>
  )
}

export default SectionHeader
