import React from 'react'
import { View } from 'react-native'
import SectionHeader from '../../../components/layout/SectionHeader'
import BreedingCard from '../../../components/card/BreedingCard'
import { DashboardBreedingItem } from '../HomeController'

interface Props {
  breedings: DashboardBreedingItem[]
  onBreedingPress: (recordId: string) => void
}

const BreedingCountdownSection: React.FC<Props> = ({ breedings, onBreedingPress }) => {
  return (
    <View>
      <SectionHeader title="Upcoming Births" count={breedings.length} />
      {breedings.map(item => (
        <BreedingCard
          key={item.record.id}
          damName={item.damName}
          expectedDueDate={item.formattedDueDate}
          daysRemaining={item.gestation.daysRemaining}
          progressPercent={item.gestation.progressPercent}
          label={item.gestation.label}
          onPress={() => onBreedingPress(item.record.id)}
        />
      ))}
    </View>
  )
}

export default BreedingCountdownSection
