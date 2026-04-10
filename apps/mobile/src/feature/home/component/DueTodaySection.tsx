import React from 'react'
import { View } from 'react-native'
import SectionHeader from '../../../components/layout/SectionHeader'
import CareEventCard from '../../../components/card/CareEventCard'
import { DashboardCareItem } from '../HomeController'

interface Props {
  items: DashboardCareItem[]
  onEventPress: (eventId: string) => void
}

const DueTodaySection: React.FC<Props> = ({ items, onEventPress }) => {
  return (
    <View>
      <SectionHeader title="Due Today" count={items.length} variant="amber" />
      {items.map(item => (
        <CareEventCard
          key={item.event.id}
          eventName={item.event.name}
          animalName={item.animalName}
          daysInfo={0}
          status="dueToday"
          onPress={() => onEventPress(item.event.id)}
        />
      ))}
    </View>
  )
}

export default DueTodaySection
