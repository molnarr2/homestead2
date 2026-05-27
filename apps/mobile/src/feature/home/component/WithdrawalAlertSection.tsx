import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import SectionHeader from '../../../components/layout/SectionHeader'
import DashboardAlertCard from '../../../components/card/DashboardAlertCard'
import { DashboardWithdrawalItem } from '../HomeController'

interface Props {
  withdrawals: DashboardWithdrawalItem[]
  totalCount: number
  onAnimalPress: (animalId: string) => void
  onViewMore: () => void
}

const WithdrawalAlertSection: React.FC<Props> = ({ withdrawals, totalCount, onAnimalPress, onViewMore }) => {
  const remaining = totalCount - withdrawals.length

  return (
    <View>
      <SectionHeader title="Active Withdrawals" count={totalCount} variant="red" onCountPress={onViewMore} />
      {withdrawals.map((w, index) => (
        <DashboardAlertCard
          key={`${w.animalId}-${w.medicationName}-${index}`}
          title={w.medicationName}
          subtitle={`${w.animalName} • ${w.withdrawalType}`}
          detail={`${w.daysRemaining} day${w.daysRemaining !== 1 ? 's' : ''} left`}
          icon="pill"
          onPress={() => onAnimalPress(w.animalId)}
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

export default WithdrawalAlertSection
