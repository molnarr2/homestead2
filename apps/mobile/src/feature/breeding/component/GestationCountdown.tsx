import React from 'react'
import { View, Text } from 'react-native'
import type { GestationStatus } from '../../../util/GestationUtility'
import { daysBetween, todayIso, formatDate } from '../../../util/DateUtility'

interface Props {
  gestationStatus: GestationStatus
}

const GestationCountdown: React.FC<Props> = ({ gestationStatus }) => {
  const { daysRemaining, progressPercent, label, isOverdue, expectedDueDate } = gestationStatus
  const overdueDays = isOverdue ? daysBetween(expectedDueDate, todayIso()) : 0

  return (
    <View className="bg-surface rounded-xl p-4 border border-border-light">
      <Text className="text-sm font-medium text-text-secondary capitalize mb-2">
        {label} Countdown
      </Text>

      {isOverdue ? (
        <Text className="text-2xl font-bold text-status-error">
          Overdue by {overdueDays} day{overdueDays !== 1 ? 's' : ''}
        </Text>
      ) : (
        <Text className="text-2xl font-bold text-text-primary">
          {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
        </Text>
      )}

      <View className="h-3 bg-border-light rounded-full mt-3 overflow-hidden">
        <View
          className={`h-full rounded-full ${isOverdue ? 'bg-status-error' : 'bg-primary'}`}
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      <Text className="text-sm text-text-secondary mt-2">
        Expected: {formatDate(expectedDueDate)}
      </Text>
    </View>
  )
}

export default GestationCountdown
