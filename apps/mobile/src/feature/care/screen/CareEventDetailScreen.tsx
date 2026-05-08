import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCareEventDetailController } from './CareEventDetailController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import PrimaryButton from '../../../components/button/PrimaryButton'
import Icon from '@react-native-vector-icons/material-design-icons'
import { tstampToDateOrNow } from '../../../schema/type/Tstamp'
import { format } from 'date-fns'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CareEventDetail'>
type Route = RouteProp<RootStackParamList, 'CareEventDetail'>

const STATUS_COLORS: Record<string, string> = {
  OVERDUE: 'bg-status-error',
  DUE_TODAY: 'bg-status-warning',
  UPCOMING: 'bg-status-success',
  FUTURE: 'bg-text-secondary',
}

const STATUS_LABELS: Record<string, string> = {
  OVERDUE: 'Overdue',
  DUE_TODAY: 'Due Today',
  UPCOMING: 'Upcoming',
  FUTURE: 'Future',
}

interface DetailRowProps {
  label: string
  value: string
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <View className="flex-row justify-between py-2 border-b border-border-light">
    <Text className="text-sm text-text-secondary">{label}</Text>
    <Text className="text-sm font-medium text-text-primary">{value}</Text>
  </View>
)

const CareEventDetailScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const controller = useCareEventDetailController(navigation, route)

  if (!controller.event) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-text-secondary">Care event not found</Text>
        </View>
      </ScreenContainer>
    )
  }

  const { event, animal, status, isComplete } = controller
  const dueDate = tstampToDateOrNow(event.dueDate)

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Care Event</Text>
        <TouchableOpacity onPress={controller.onEdit} activeOpacity={0.7} className="p-1">
          <Icon name="pencil" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-text-primary mt-4">{event.name}</Text>

        {animal && (
          <TouchableOpacity
            onPress={() => navigation.navigate('AnimalDetail', { animalId: animal.id })}
            activeOpacity={0.7}
          >
            <Text className="text-base text-primary mt-1">{animal.name}</Text>
          </TouchableOpacity>
        )}

        {status && !isComplete && (
          <View className={`self-start mt-3 px-3 py-1 rounded-full ${STATUS_COLORS[status.status] ?? 'bg-text-secondary'}`}>
            <Text className="text-xs font-bold text-text-inverse">{STATUS_LABELS[status.status]}</Text>
          </View>
        )}

        <View className="mt-4 bg-surface rounded-xl p-4 border border-border-light">
          <DetailRow label="Due Date" value={format(dueDate, 'MMM d, yyyy')} />
          <DetailRow label="Type" value={event.type === 'careRecurring' ? 'Recurring' : 'One-time'} />
          {event.type === 'careRecurring' && event.cycle > 0 && (
            <DetailRow label="Cycle" value={`Every ${event.cycle} days`} />
          )}
          {event.contactName ? <DetailRow label="Contact" value={event.contactName} /> : null}
          {event.contactPhone ? <DetailRow label="Phone" value={event.contactPhone} /> : null}
        </View>

        {event.notes ? (
          <View className="mt-4 bg-surface rounded-xl p-4 border border-border-light">
            <Text className="text-sm font-medium text-text-secondary mb-1">Notes</Text>
            <Text className="text-base text-text-primary">{event.notes}</Text>
          </View>
        ) : null}

        {isComplete && event.completedDate && (
          <View className="mt-4 bg-status-success/10 rounded-xl p-4 border border-status-success">
            <Text className="text-sm font-semibold text-status-success">
              Completed on {format(tstampToDateOrNow(event.completedDate), 'MMM d, yyyy')}
            </Text>
          </View>
        )}

        {!isComplete && (
          <View className="mt-6 mb-8">
            <PrimaryButton title="Mark Complete" onPress={controller.onComplete} />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  )
}

export default CareEventDetailScreen
