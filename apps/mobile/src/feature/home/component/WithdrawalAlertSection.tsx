import React from 'react'
import { View } from 'react-native'
import SectionHeader from '../../../components/layout/SectionHeader'
import DashboardAlertCard from '../../../components/card/DashboardAlertCard'
import { DashboardWithdrawalItem } from '../HomeController'

interface Props {
  withdrawals: DashboardWithdrawalItem[]
  onAnimalPress: (animalId: string) => void
}

const WithdrawalAlertSection: React.FC<Props> = ({ withdrawals, onAnimalPress }) => {
  return (
    <View>
      <SectionHeader title="Active Withdrawals" count={withdrawals.length} variant="red" />
      {withdrawals.map((w, index) => (
        <DashboardAlertCard
          key={`${w.animalId}-${w.medicationName}-${index}`}
          title={w.medicationName}
          subtitle={`${w.animalName} \u2022 ${w.withdrawalType}`}
          detail={`${w.daysRemaining} day${w.daysRemaining !== 1 ? 's' : ''} left`}
          icon="pill"
          onPress={() => onAnimalPress(w.animalId)}
        />
      ))}
    </View>
  )
}

export default WithdrawalAlertSection
