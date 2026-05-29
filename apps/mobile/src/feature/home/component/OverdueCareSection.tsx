import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import SectionHeader from '../../../components/layout/SectionHeader'
import CareEventCard from '../../../components/card/CareEventCard'
import { DashboardCareItem } from '../HomeController'

interface Props {
  items: DashboardCareItem[]
  totalCount: number
  onEventPress: (eventId: string) => void
  onViewMore: () => void
}

const OverdueCareSection: React.FC<Props> = ({ items, totalCount, onEventPress, onViewMore }) => {
  const remaining = totalCount - items.length

  return (
    <View>
      <SectionHeader title="Overdue" count={totalCount} variant="red" onCountPress={onViewMore} />
      {items.map(item => (
        <CareEventCard
          key={item.event.id}
          eventName={item.event.name}
          animalName={item.animalName}
          daysInfo={item.daysOverdue}
          status="overdue"
          onPress={() => onEventPress(item.event.id)}
        />
      ))}
      {remaining > 0 && (
        <TouchableOpacity
          onPress={onViewMore}
          activeOpacity={0.7}
          className="bg-surface rounded-lg border-l-4 border-l-border p-3 mb-2"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-2">
              <Text className="text-base font-medium text-primary">View all</Text>
              <Text className="text-sm text-text-secondary mt-0.5">{remaining} more not shown</Text>
            </View>
            <Icon name="chevron-right" size={18} color="#B0A49E" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default OverdueCareSection
