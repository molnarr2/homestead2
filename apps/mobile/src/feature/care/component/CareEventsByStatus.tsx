import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import CareEvent from '../../../schema/care/CareEvent'
import { tstampToDateOrNow } from '../../../schema/type/Tstamp'
import { format } from 'date-fns'

interface Props {
  title: string
  events: CareEvent[]
  statusColor: string
  getAnimalName: (animalId: string) => string
  onEventPress: (eventId: string) => void
  onComplete: (event: CareEvent) => void
}

const COLOR_MAP: Record<string, { header: string; border: string; bg: string }> = {
  red: { header: 'text-status-error', border: 'border-l-status-error', bg: 'bg-status-error/10' },
  amber: { header: 'text-status-warning', border: 'border-l-status-warning', bg: 'bg-status-warning/10' },
  green: { header: 'text-status-success', border: 'border-l-status-success', bg: 'bg-status-success/10' },
  gray: { header: 'text-text-secondary', border: 'border-l-border-light', bg: 'bg-surface' },
}

const CareEventsByStatus: React.FC<Props> = ({ title, events, statusColor, getAnimalName, onEventPress, onComplete }) => {
  const colors = COLOR_MAP[statusColor] ?? COLOR_MAP.gray

  return (
    <View className="mt-2">
      <Text className={`px-4 py-2 text-sm font-bold uppercase ${colors.header}`}>{title}</Text>
      {events.map(event => {
        const dueDate = tstampToDateOrNow(event.dueDate)
        return (
          <TouchableOpacity
            key={event.id}
            className={`mx-4 mb-2 rounded-lg p-3 border border-border-light border-l-4 ${colors.border} ${colors.bg}`}
            onPress={() => onEventPress(event.id)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-base font-semibold text-text-primary">{event.name}</Text>
                <Text className="text-sm text-text-secondary">
                  {getAnimalName(event.animalId)} · {format(dueDate, 'MMM d, yyyy')}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                {event.type === 'careRecurring' && (
                  <Icon name="refresh" size={16} color="#6B6B6B" />
                )}
                <TouchableOpacity
                  className="bg-primary rounded-lg px-3 py-1.5"
                  onPress={() => onComplete(event)}
                  activeOpacity={0.7}
                >
                  <Text className="text-xs font-semibold text-text-inverse">Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default CareEventsByStatus
