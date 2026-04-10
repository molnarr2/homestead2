import React from 'react'
import { View, Text } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'

interface Props {
  icon: React.ComponentProps<typeof Icon>['name']
  title: string
  subtitle?: string
}

const EmptyState: React.FC<Props> = ({ icon, title, subtitle }) => {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Icon name={icon} size={64} color="#9CA3AF" />
      <Text className="text-xl font-semibold text-text-primary mt-4">{title}</Text>
      {subtitle && (
        <Text className="text-sm text-text-secondary text-center mt-2">{subtitle}</Text>
      )}
    </View>
  )
}

export default EmptyState
