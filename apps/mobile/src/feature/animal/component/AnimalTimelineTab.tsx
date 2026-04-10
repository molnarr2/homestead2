import React, { useMemo } from 'react'
import { View, Text, FlatList } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import CareEvent from '../../../schema/care/CareEvent'
import HealthRecord from '../../../schema/health/HealthRecord'
import BreedingRecord from '../../../schema/breeding/BreedingRecord'
import Note from '../../../schema/notes/Note'
import WeightLog from '../../../schema/weight/WeightLog'
import { tstampToDateOrNow } from '../../../schema/type/Tstamp'
import { formatDate } from '../../../util/DateUtility'
import EmptyState from '../../../components/layout/EmptyState'

interface Props {
  careEvents: CareEvent[]
  healthRecords: HealthRecord[]
  breedingRecords: BreedingRecord[]
  notes: Note[]
  weightLogs: WeightLog[]
}

interface TimelineItem {
  id: string
  icon: React.ComponentProps<typeof Icon>['name']
  description: string
  date: string
  sortDate: number
  color: string
}

const AnimalTimelineTab: React.FC<Props> = ({ careEvents, healthRecords, breedingRecords, notes, weightLogs }) => {
  const timelineItems = useMemo((): TimelineItem[] => {
    const items: TimelineItem[] = []

    for (const event of careEvents) {
      const date = tstampToDateOrNow(event.completedDate ?? event.dueDate)
      items.push({
        id: `care-${event.id}`,
        icon: 'medical-bag',
        description: `Care: ${event.name}`,
        date: formatDate(date.toISOString()),
        sortDate: date.getTime(),
        color: '#4CAF50',
      })
    }

    for (const record of healthRecords) {
      items.push({
        id: `health-${record.id}`,
        icon: 'heart-pulse',
        description: `${record.recordType}: ${record.name}`,
        date: formatDate(record.date),
        sortDate: record.date ? new Date(record.date).getTime() : 0,
        color: '#E53935',
      })
    }

    for (const record of breedingRecords) {
      items.push({
        id: `breeding-${record.id}`,
        icon: 'heart-multiple',
        description: `Breeding: ${record.status}${record.sireName ? ` with ${record.sireName}` : ''}`,
        date: formatDate(record.breedingDate),
        sortDate: record.breedingDate ? new Date(record.breedingDate).getTime() : 0,
        color: '#FF9800',
      })
    }

    for (const note of notes) {
      const date = tstampToDateOrNow(note.admin.created_at)
      items.push({
        id: `note-${note.id}`,
        icon: 'note-text',
        description: `Note: ${note.text.substring(0, 60)}${note.text.length > 60 ? '...' : ''}`,
        date: formatDate(date.toISOString()),
        sortDate: date.getTime(),
        color: '#2196F3',
      })
    }

    for (const log of weightLogs) {
      items.push({
        id: `weight-${log.id}`,
        icon: 'scale-bathroom',
        description: `Weight: ${log.weight} ${log.weightUnit}${log.bodyConditionScore ? ` (BCS: ${log.bodyConditionScore})` : ''}`,
        date: formatDate(log.date),
        sortDate: log.date ? new Date(log.date).getTime() : 0,
        color: '#8B6F47',
      })
    }

    items.sort((a, b) => b.sortDate - a.sortDate)
    return items
  }, [careEvents, healthRecords, breedingRecords, notes, weightLogs])

  if (timelineItems.length === 0) {
    return <EmptyState icon="timeline-clock" title="No events yet" subtitle="Events will appear here as you add records" />
  }

  return (
    <FlatList
      data={timelineItems}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View className="flex-row items-start px-4 py-3 border-b border-border-light">
          <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: item.color + '20' }}>
            <Icon name={item.icon} size={16} color={item.color} />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-text-primary">{item.description}</Text>
            <Text className="text-xs text-text-secondary mt-1">{item.date}</Text>
          </View>
        </View>
      )}
      showsVerticalScrollIndicator={false}
    />
  )
}

export default AnimalTimelineTab
