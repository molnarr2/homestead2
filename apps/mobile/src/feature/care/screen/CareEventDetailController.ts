import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCareStore } from '../../../store/careStore'
import { useGroupStore } from '../../../store/groupStore'
import { useAnimalStore } from '../../../store/animalStore'
import { getCareStatus } from '../../../util/CareUtility'
import { bsCareService, bsGroupService } from '../../../Bootstrap'

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

  const onComplete = async () => {
    if (!event) return
    if (groupId) {
      await bsGroupService.completeGroupCareEvent(groupId, event)
    } else {
      await bsCareService.completeCareEvent(event)
    }
    navigation.goBack()
  }

  const onBack = () => navigation.goBack()
  const onEdit = () => navigation.navigate('EditCareEvent', { eventId, groupId })

  return { event, animal, status, isComplete, onComplete, onBack, onEdit }
}
