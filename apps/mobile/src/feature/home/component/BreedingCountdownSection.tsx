import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import SectionHeader from '../../../components/layout/SectionHeader'
import BreedingCard from '../../../components/card/BreedingCard'
import { DashboardBreedingItem } from '../HomeController'

interface Props {
  breedings: DashboardBreedingItem[]
  totalCount: number
  onBreedingPress: (recordId: string) => void
  onViewMore: () => void
}

const BreedingCountdownSection: React.FC<Props> = ({ breedings, totalCount, onBreedingPress, onViewMore }) => {
  const remaining = totalCount - breedings.length

  return (
    <View>
      <SectionHeader title="Upcoming Births" count={totalCount} onCountPress={onViewMore} />
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
            <Icon name="chevron-right" size={18} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default BreedingCountdownSection
