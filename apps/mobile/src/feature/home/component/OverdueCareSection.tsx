import React from 'react'
import { View } from 'react-native'
import SectionHeader from '../../../components/layout/SectionHeader'
import CareEventCard from '../../../components/card/CareEventCard'
import { DashboardCareItem } from '../HomeController'

interface Props {
  items: DashboardCareItem[]
  onEventPress: (eventId: string) => void
}

const OverdueCareSection: React.FC<Props> = ({ items, onEventPress }) => {
  return (
    <View>
      <SectionHeader title="Overdue" count={items.length} variant="red" />
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
    </View>
  )
}

export default OverdueCareSection
