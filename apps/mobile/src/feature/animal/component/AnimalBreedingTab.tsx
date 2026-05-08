import React from 'react'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import BreedingRecord from '../../../schema/breeding/BreedingRecord'
import { formatDate } from '../../../util/DateUtility'
import { differenceInDays, parseISO } from 'date-fns'
import EmptyState from '../../../components/layout/EmptyState'

interface Props {
  breedingRecords: BreedingRecord[]
  onAddBreeding: () => void
  onBreedingRecordPress?: (recordId: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-status-warning',
  completed: 'bg-status-success',
  failed: 'bg-status-error',
}

const AnimalBreedingTab: React.FC<Props> = ({ breedingRecords, onAddBreeding, onBreedingRecordPress }) => {
  const sortedRecords = [...breedingRecords].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1
    if (a.status !== 'active' && b.status === 'active') return 1
    if (!a.breedingDate || !b.breedingDate) return 0
    return new Date(b.breedingDate).getTime() - new Date(a.breedingDate).getTime()
  })

  return (
    <View className="flex-1">
      {sortedRecords.length === 0 ? (
        <EmptyState icon="heart-multiple" title="No breeding records" subtitle="Track breeding events and expected due dates" />
      ) : (
        <FlatList
          data={sortedRecords}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const daysUntilDue = item.expectedDueDate
              ? differenceInDays(parseISO(item.expectedDueDate), new Date())
              : null

            return (
              <TouchableOpacity
                className="mx-4 mt-2 bg-surface rounded-lg p-3 border border-border-light"
                onPress={() => onBreedingRecordPress?.(item.id)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-text-primary">
                      {item.sireName ? `Sire: ${item.sireName}` : 'Breeding Record'}
                    </Text>
                    <Text className="text-xs text-text-secondary">
                      Bred: {formatDate(item.breedingDate)} · {item.method}
                    </Text>
                  </View>
                  <View className={`px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status] || 'bg-primary'}`}>
                    <Text className="text-xs font-bold text-text-inverse capitalize">{item.status}</Text>
                  </View>
                </View>

                {item.status === 'active' && item.expectedDueDate ? (
                  <View className="mt-2 p-2 bg-backgroundDark rounded">
                    <Text className="text-xs text-text-secondary">
                      Due: {formatDate(item.expectedDueDate)}
                      {daysUntilDue !== null ? ` (${daysUntilDue > 0 ? `${daysUntilDue} days` : 'overdue'})` : ''}
                    </Text>
                  </View>
                ) : null}

                {item.status === 'completed' ? (
                  <View className="mt-2">
                    <Text className="text-xs text-text-secondary">
                      Born: {formatDate(item.birthDate)} · {item.bornAlive} alive{item.stillborn > 0 ? `, ${item.stillborn} stillborn` : ''}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            )
          }}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-primary items-center justify-center shadow-lg"
        onPress={onAddBreeding}
        activeOpacity={0.7}
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  )
}

export default AnimalBreedingTab
