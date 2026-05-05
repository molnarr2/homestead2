import React from 'react'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import HealthRecord from '../../../schema/health/HealthRecord'
import { WithdrawalResult } from '../../../util/WithdrawalUtility'
import { formatDate } from '../../../util/DateUtility'
import EmptyState from '../../../components/layout/EmptyState'
import type { GroupHealthRecord } from '../screen/AnimalDetailController'

interface Props {
  healthRecords: HealthRecord[]
  groupHealthRecords?: GroupHealthRecord[]
  activeWithdrawals: WithdrawalResult[]
  onAddHealth: () => void
  onGroupPress?: (groupId: string) => void
}

const RECORD_TYPE_ICONS: Record<string, React.ComponentProps<typeof Icon>['name']> = {
  vaccination: 'needle',
  medication: 'pill',
  deworming: 'bug',
  vetVisit: 'stethoscope',
  illness: 'thermometer',
  injury: 'bandage',
}

const AnimalHealthTab: React.FC<Props> = ({ healthRecords, groupHealthRecords, activeWithdrawals, onAddHealth, onGroupPress }) => {
  type HealthListItem = { record: HealthRecord; groupName?: string; groupId?: string }

  const allItems: HealthListItem[] = [
    ...healthRecords.map(r => ({ record: r })),
    ...(groupHealthRecords ?? []).map(g => ({ record: g.record, groupName: g.groupName, groupId: g.groupId })),
  ]

  const sortedItems = [...allItems].sort((a, b) => {
    if (!a.record.date || !b.record.date) return 0
    return new Date(b.record.date).getTime() - new Date(a.record.date).getTime()
  })

  return (
    <View className="flex-1">
      {activeWithdrawals.length > 0 ? (
        <View className="mx-4 mt-3 p-3 bg-status-error/10 rounded-lg border border-status-error/30">
          <View className="flex-row items-center mb-1">
            <Icon name="alert-circle" size={16} color="#E53935" />
            <Text className="text-sm font-semibold text-status-error ml-1">
              Active Withdrawals ({activeWithdrawals.length})
            </Text>
          </View>
          {activeWithdrawals.map((w, idx) => (
            <Text key={idx} className="text-xs text-text-secondary ml-5">
              {w.medicationName} - {w.withdrawalType} ({w.daysRemaining} days remaining)
            </Text>
          ))}
        </View>
      ) : null}

      {sortedItems.length === 0 ? (
        <EmptyState icon="heart-pulse" title="No health records" subtitle="Add health records to track vaccinations, medications, and more" />
      ) : (
        <FlatList
          data={sortedItems}
          keyExtractor={(item, index) => `${item.record.id}-${index}`}
          renderItem={({ item }) => {
            const content = (
              <View className="mx-4 mt-2 bg-surface rounded-lg p-3 border border-border-light">
                <View className="flex-row items-center">
                  <Icon name={RECORD_TYPE_ICONS[item.record.recordType] || 'medical-bag'} size={20} color="#4A6741" />
                  <View className="flex-1 ml-2">
                    <View className="flex-row items-center">
                      <Text className="text-sm font-semibold text-text-primary">{item.record.name}</Text>
                      {item.groupName ? (
                        <View className="ml-2 px-2 py-0.5 rounded-full bg-primary/15">
                          <Text className="text-xs font-medium text-primary">{item.groupName}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className="text-xs text-text-secondary capitalize">{item.record.recordType} · {formatDate(item.record.date)}</Text>
                  </View>
                </View>
                {item.record.notes ? (
                  <Text className="text-xs text-text-secondary mt-2">{item.record.notes}</Text>
                ) : null}
              </View>
            )

            if (item.groupId && onGroupPress) {
              return (
                <TouchableOpacity onPress={() => onGroupPress(item.groupId!)} activeOpacity={0.7}>
                  {content}
                </TouchableOpacity>
              )
            }
            return content
          }}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-primary items-center justify-center shadow-lg"
        onPress={onAddHealth}
        activeOpacity={0.7}
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  )
}

export default AnimalHealthTab
