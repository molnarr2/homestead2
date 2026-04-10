import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'

interface Props {
  title: string
  subtitle: string
  detail: string
  icon: React.ComponentProps<typeof Icon>['name']
  onPress: () => void
}

const DashboardAlertCard: React.FC<Props> = ({ title, subtitle, detail, icon, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-surface rounded-lg border-l-4 border-l-status-error p-3 mb-2"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <Icon name={icon} size={24} color="#DC2626" />
        <View className="flex-1 ml-3 mr-2">
          <Text className="text-base font-medium text-text-primary">{title}</Text>
          <Text className="text-sm text-text-secondary mt-0.5">{subtitle}</Text>
        </View>
        <View className="items-end">
          <Text className="text-xs font-semibold text-status-error">{detail}</Text>
          <Icon name="chevron-right" size={18} color="#9CA3AF" />
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default DashboardAlertCard
