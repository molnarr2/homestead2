import React from 'react'
import { View, Text } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import { UpcomingEventItem } from '../HomeController'

interface Props {
  item: UpcomingEventItem
  showBorder: boolean
}

const UpcomingEventRow: React.FC<Props> = ({ item, showBorder }) => {
  return (
    <View className={`flex-row items-center py-2 ${showBorder ? 'border-b border-border' : ''}`}>
      <Icon
        name={item.type === 'care' ? 'medical-bag' : 'baby-carriage'}
        size={18}
        color="#6B6B6B"
      />
      <View className="flex-1 ml-2">
        <Text className="text-sm font-medium text-text-primary">{item.label}</Text>
        <Text className="text-xs text-text-secondary">{item.animalName}</Text>
      </View>
      <Text className="text-xs text-text-secondary">
        {item.daysUntil === 0 ? 'Today' : item.daysUntil === 1 ? '1 day' : `${item.daysUntil} days`}
      </Text>
    </View>
  )
}

export default UpcomingEventRow
