import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import type { WithdrawalResult } from '../../../util/WithdrawalUtility'
import type HealthRecord from '../../../schema/health/HealthRecord'
import WithdrawalStatusCard from './WithdrawalStatusCard'

interface Props {
  withdrawals: WithdrawalResult[]
  records: HealthRecord[]
  animalName: string
}

const WithdrawalBanner: React.FC<Props> = ({ withdrawals, records, animalName }) => {
  const [expanded, setExpanded] = useState(false)

  if (withdrawals.length === 0) return null

  return (
    <View>
      <TouchableOpacity
        className="flex-row items-center justify-between px-4 py-2 bg-status-error/10"
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          <Icon name="alert-circle" size={16} color="#E53935" />
          <Text className="text-xs font-semibold text-status-error ml-1">
            {withdrawals.length} Active Withdrawal{withdrawals.length > 1 ? 's' : ''}
          </Text>
        </View>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#E53935" />
      </TouchableOpacity>

      {expanded ? (
        <View className="px-4 py-2">
          {withdrawals.map((w, idx) => (
            <WithdrawalStatusCard
              key={idx}
              withdrawal={w}
              recordName={w.medicationName}
              animalName={animalName}
            />
          ))}
        </View>
      ) : null}
    </View>
  )
}

export default WithdrawalBanner
