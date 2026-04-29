import React from 'react'
import { View, Text, Pressable } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import SectionHeader from '../../../components/layout/SectionHeader'
import { UpcomingEventItem } from '../HomeController'

interface Props {
  items: UpcomingEventItem[]
  totalCount: number
  onViewAll: () => void
}

const UpcomingEventsSection: React.FC<Props> = ({ items, totalCount, onViewAll }) => {
  return (
    <View>
      <SectionHeader title="Upcoming (Next 7 Days)" />
      {items.length === 0 ? (
        <View className="bg-surface rounded-xl p-4 items-center">
          <Text className="text-sm text-text-secondary">Nothing scheduled this week</Text>
        </View>
      ) : (
        <View className="bg-surface rounded-xl p-3">
          {items.map((item, index) => (
            <View
              key={`${item.type}-${item.label}-${item.animalName}-${index}`}
              className={`flex-row items-center py-2 ${index < items.length - 1 ? 'border-b border-border' : ''}`}
            >
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
          ))}
          {totalCount > 5 && (
            <Pressable className="pt-2 items-center" onPress={onViewAll}>
              <Text className="text-sm font-medium text-primary">View all</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  )
}

export default UpcomingEventsSection
