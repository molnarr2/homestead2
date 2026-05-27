import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import SectionHeader from '../../../components/layout/SectionHeader'
import UpcomingEventRow from './UpcomingEventRow'
import { UpcomingEventItem } from '../HomeController'

interface Props {
  items: UpcomingEventItem[]
  totalCount: number
  onViewMore: () => void
}

const UpcomingEventsSection: React.FC<Props> = ({ items, totalCount, onViewMore }) => {
  const remaining = totalCount - items.length

  return (
    <View>
      <SectionHeader
        title="Upcoming (Next 7 Days)"
        count={totalCount}
        onCountPress={totalCount > 0 ? onViewMore : undefined}
      />
      {items.length === 0 ? (
        <View className="bg-surface rounded-xl p-4 items-center">
          <Text className="text-sm text-text-secondary">Nothing scheduled this week</Text>
        </View>
      ) : (
        <View className="bg-surface rounded-xl p-3">
          {items.map((item, index) => (
            <UpcomingEventRow
              key={`${item.type}-${item.label}-${item.animalName}-${index}`}
              item={item}
              showBorder={index < items.length - 1}
            />
          ))}
          {remaining > 0 && (
            <TouchableOpacity
              onPress={onViewMore}
              activeOpacity={0.7}
              className="flex-row items-center py-2 border-t border-border"
            >
              <Icon name="calendar-clock" size={18} color="#6B6B6B" />
              <View className="flex-1 ml-2">
                <Text className="text-sm font-medium text-primary">View all</Text>
                <Text className="text-xs text-text-secondary">{remaining} more not shown</Text>
              </View>
              <Icon name="chevron-right" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

export default UpcomingEventsSection
