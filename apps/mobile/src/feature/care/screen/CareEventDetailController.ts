import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCareStore } from '../../../store/careStore'
import { useGroupStore } from '../../../store/groupStore'
import { useAnimalStore } from '../../../store/animalStore'
import { getCareStatus } from '../../../util/CareUtility'
import { bsCareService, bsGroupService } from '../../../Bootstrap'
import type { HealthRecordType } from '../../../schema/health/HealthRecord'
import { todayIso } from '../../../util/DateUtility'
import { tstampToDateOrNow } from '../../../schema/type/Tstamp'
import { format } from 'date-fns'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CareEventDetail'>
type Route = RouteProp<RootStackParamList, 'CareEventDetail'>

export function useCareEventDetailController(navigation: Navigation, route: Route) {
  const { eventId, groupId } = route.params
  const { careEvents } = useCareStore()
  const { groupCareEvents } = useGroupStore()
  const { animals } = useAnimalStore()

  const event = groupId
    ? (groupCareEvents[groupId] ?? []).find(e => e.id === eventId)
    : careEvents.find(e => e.id === eventId)

  const animal = animals.find(a => a.id === event?.animalId)

  const status = event ? getCareStatus(event.dueDate) : null
  const isComplete = !!event?.completedDate
  const isMedical = !!(event?.healthRecordType)

  const performComplete = async () => {
    if (!event) return

    if (event.healthRecordType) {
      navigation.navigate('CreateHealthRecord', {
        animalId: event.animalId,
        recordType: event.healthRecordType as HealthRecordType,
        groupId: groupId || undefined,
        name: event.name,
        date: todayIso(),
        providerName: event.contactName,
        providerPhone: event.contactPhone,
        careEventId: event.id,
        careEventGroupId: groupId || undefined,
      })
      return
    }

    if (groupId) {
      await bsGroupService.completeGroupCareEvent(groupId, event)
    } else {
      await bsCareService.completeCareEvent(event)
    }
    navigation.goBack()
  }

  const onComplete = () => {
    if (!event) return

    const notYetDue = status?.status === 'UPCOMING' || status?.status === 'FUTURE'
    if (notYetDue) {
      Alert.alert(
        'Complete Early?',
        `This is not due until ${format(tstampToDateOrNow(event.dueDate), 'MMM d, yyyy')}. Completing it now marks it done ahead of schedule. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Complete', onPress: () => performComplete() },
        ]
      )
      return
    }

    performComplete()
  }

  const onDelete = () => {
    if (!event) return
    Alert.alert(
      'Delete Care Event',
      `Are you sure you want to delete "${event.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (groupId) {
              await bsGroupService.deleteGroupCareEvent(groupId, event.id)
            } else {
              await bsCareService.deleteCareEvent(event.id)
            }
            navigation.goBack()
          },
        },
      ]
    )
  }

  const onBack = () => navigation.goBack()
  const onEdit = () => navigation.navigate('EditCareEvent', { eventId, groupId })

  return { event, animal, status, isComplete, isMedical, onComplete, onDelete, onBack, onEdit }
}
