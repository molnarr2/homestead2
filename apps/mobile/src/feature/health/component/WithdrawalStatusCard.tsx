import React from 'react'
import { View, Text } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import type { WithdrawalResult } from '../../../util/WithdrawalUtility'
import { formatDate } from '../../../util/DateUtility'

interface Props {
  withdrawal: WithdrawalResult
  recordName: string
  animalName: string
}

const WithdrawalStatusCard: React.FC<Props> = ({ withdrawal, recordName, animalName }) => {
  const isActive = withdrawal.status === 'ACTIVE'

  return (
    <View className={`rounded-lg p-3 border mb-2 ${isActive ? 'bg-status-error/10 border-status-error/30' : 'bg-status-success/10 border-status-success/30'}`}>
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center flex-1">
          <Icon
            name={isActive ? 'alert-circle' : 'check-circle'}
            size={18}
            color={isActive ? '#E53935' : '#43A047'}
          />
          <Text className={`text-sm font-bold ml-1 ${isActive ? 'text-status-error' : 'text-status-success'}`}>
            {withdrawal.status}
          </Text>
        </View>
        <View className={`px-2 py-0.5 rounded-full ${isActive ? 'bg-status-error' : 'bg-status-success'}`}>
          <Text className="text-xs font-bold text-text-inverse capitalize">{withdrawal.withdrawalType}</Text>
        </View>
      </View>

      <Text className="text-sm font-semibold text-text-primary">{recordName}</Text>
      {animalName ? (
        <Text className="text-xs text-text-secondary">{animalName}</Text>
      ) : null}

      {isActive ? (
        <View className="flex-row items-center mt-2">
          <Icon name="clock-outline" size={14} color="#E53935" />
          <Text className="text-sm font-bold text-status-error ml-1">
            {withdrawal.daysRemaining} day{withdrawal.daysRemaining !== 1 ? 's' : ''} remaining
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center mt-2">
          <Icon name="calendar-check" size={14} color="#43A047" />
          <Text className="text-xs text-status-success ml-1">
            Cleared {formatDate(withdrawal.withdrawalEndDate)}
          </Text>
        </View>
      )}

      <Text className="text-xs text-text-secondary mt-1">
        End date: {formatDate(withdrawal.withdrawalEndDate)}
      </Text>
    </View>
  )
}

export default WithdrawalStatusCard
