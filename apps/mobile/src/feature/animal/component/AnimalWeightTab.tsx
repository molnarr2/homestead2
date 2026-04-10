import React from 'react'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import WeightLog from '../../../schema/weight/WeightLog'
import { formatDate } from '../../../util/DateUtility'
import EmptyState from '../../../components/layout/EmptyState'

interface Props {
  weightLogs: WeightLog[]
  onAddWeight: () => void
}

const AnimalWeightTab: React.FC<Props> = ({ weightLogs, onAddWeight }) => {
  const sortedLogs = [...weightLogs].sort((a, b) => {
    if (!a.date || !b.date) return 0
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <View className="flex-1">
      {sortedLogs.length === 0 ? (
        <EmptyState icon="scale-bathroom" title="No weight logs" subtitle="Track weight changes and body condition over time" />
      ) : (
        <View className="flex-1">
          <View className="flex-row px-4 py-2 bg-backgroundDark border-b border-border-light">
            <Text className="flex-1 text-xs font-semibold text-text-secondary">DATE</Text>
            <Text className="w-24 text-xs font-semibold text-text-secondary text-right">WEIGHT</Text>
            <Text className="w-16 text-xs font-semibold text-text-secondary text-right">BCS</Text>
          </View>
          <FlatList
            data={sortedLogs}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => {
              const prevLog = index < sortedLogs.length - 1 ? sortedLogs[index + 1] : null
              const weightChange = prevLog ? item.weight - prevLog.weight : null

              return (
                <View className="flex-row items-center px-4 py-3 border-b border-border-light">
                  <View className="flex-1">
                    <Text className="text-sm text-text-primary">{formatDate(item.date)}</Text>
                  </View>
                  <View className="w-24 items-end">
                    <Text className="text-sm font-semibold text-text-primary">
                      {item.weight} {item.weightUnit}
                    </Text>
                    {weightChange !== null && weightChange !== 0 ? (
                      <Text className={`text-xs ${weightChange > 0 ? 'text-status-success' : 'text-status-error'}`}>
                        {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}
                      </Text>
                    ) : null}
                  </View>
                  <View className="w-16 items-end">
                    <Text className="text-sm text-text-primary">{item.bodyConditionScore || '-'}</Text>
                  </View>
                </View>
              )
            }}
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-primary items-center justify-center shadow-lg"
        onPress={onAddWeight}
        activeOpacity={0.7}
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  )
}

export default AnimalWeightTab
