import React from 'react'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import CareEvent from '../../../schema/care/CareEvent'
import { tstampToDateOrNow } from '../../../schema/type/Tstamp'
import { isBefore, isToday, startOfToday, differenceInDays } from 'date-fns'
import EmptyState from '../../../components/layout/EmptyState'
import type { GroupCareEvent } from '../screen/AnimalDetailController'

interface Props {
  careEvents: CareEvent[]
  groupCareEvents?: GroupCareEvent[]
  onAddCare: () => void
  onGroupPress?: (groupId: string) => void
  onCareEventPress?: (eventId: string) => void
}

type CareStatus = 'overdue' | 'dueToday' | 'upcoming' | 'completed'

const STATUS_STYLES: Record<CareStatus, { bg: string; text: string; label: string }> = {
  overdue: { bg: 'bg-status-error/10 border-l-4 border-l-status-error', text: 'text-status-error', label: 'Overdue' },
  dueToday: { bg: 'bg-status-warning/10 border-l-4 border-l-status-warning', text: 'text-status-warning', label: 'Due Today' },
  upcoming: { bg: 'bg-surface border-l-4 border-l-status-info', text: 'text-status-info', label: 'Upcoming' },
  completed: { bg: 'bg-surface border-l-4 border-l-status-success', text: 'text-status-success', label: 'Completed' },
}

function getCareStatus(event: CareEvent): CareStatus {
  if (event.completedDate !== null) return 'completed'
  const dueDate = tstampToDateOrNow(event.dueDate)
  const today = startOfToday()
  if (isBefore(dueDate, today)) return 'overdue'
  if (isToday(dueDate)) return 'dueToday'
  return 'upcoming'
}

const AnimalCareTab: React.FC<Props> = ({ careEvents, groupCareEvents, onAddCare, onGroupPress, onCareEventPress }) => {
  type CareListItem = { event: CareEvent; groupName?: string; groupId?: string }

  const allItems: CareListItem[] = [
    ...careEvents.map(e => ({ event: e })),
    ...(groupCareEvents ?? []).map(g => ({ event: g.event, groupName: g.groupName, groupId: g.groupId })),
  ]

  const sortedItems = [...allItems].sort((a, b) => {
    const statusOrder: Record<CareStatus, number> = { overdue: 0, dueToday: 1, upcoming: 2, completed: 3 }
    const statusA = getCareStatus(a.event)
    const statusB = getCareStatus(b.event)
    if (statusOrder[statusA] !== statusOrder[statusB]) return statusOrder[statusA] - statusOrder[statusB]
    const dateA = tstampToDateOrNow(a.event.dueDate).getTime()
    const dateB = tstampToDateOrNow(b.event.dueDate).getTime()
    return dateA - dateB
  })

  return (
    <View className="flex-1">
      {sortedItems.length === 0 ? (
        <EmptyState icon="medical-bag" title="No care events" subtitle="Track scheduled care tasks for this animal" />
      ) : (
        <FlatList
          data={sortedItems}
          keyExtractor={(item, index) => `${item.event.id}-${index}`}
          renderItem={({ item }) => {
            const status = getCareStatus(item.event)
            const style = STATUS_STYLES[status]
            const dueDate = tstampToDateOrNow(item.event.dueDate)
            const daysInfo = differenceInDays(dueDate, new Date())

            const content = (
              <View className={`mx-4 mt-2 rounded-lg p-3 border border-border-light ${style.bg}`}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-sm font-semibold text-text-primary">{item.event.name}</Text>
                      {item.groupName ? (
                        <View className="ml-2 px-2 py-0.5 rounded-full bg-primary/15">
                          <Text className="text-xs font-medium text-primary">{item.groupName}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className={`text-xs mt-0.5 ${style.text}`}>
                      {style.label}{status !== 'completed' && daysInfo !== 0 ? ` · ${Math.abs(daysInfo)} day${Math.abs(daysInfo) !== 1 ? 's' : ''} ${daysInfo < 0 ? 'ago' : 'away'}` : ''}
                    </Text>
                  </View>
                  {item.event.type === 'careRecurring' ? (
                    <Icon name="refresh" size={16} color="#6B6B6B" />
                  ) : null}
                </View>
              </View>
            )

            if (item.groupId && onGroupPress) {
              return (
                <TouchableOpacity onPress={() => onGroupPress(item.groupId!)} activeOpacity={0.7}>
                  {content}
                </TouchableOpacity>
              )
            }
            if (onCareEventPress) {
              return (
                <TouchableOpacity onPress={() => onCareEventPress(item.event.id)} activeOpacity={0.7}>
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
        onPress={onAddCare}
        activeOpacity={0.7}
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  )
}

export default AnimalCareTab
