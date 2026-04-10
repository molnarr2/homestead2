import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCareStore } from '../../../store/careStore'
import { useAnimalStore } from '../../../store/animalStore'
import { getCareStatus } from '../../../util/CareUtility'
import { bsCareService } from '../../../Bootstrap'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CareEventDetail'>
type Route = RouteProp<RootStackParamList, 'CareEventDetail'>

export function useCareEventDetailController(navigation: Navigation, route: Route) {
  const { eventId } = route.params
  const { careEvents } = useCareStore()
  const { animals } = useAnimalStore()
  const event = careEvents.find(e => e.id === eventId)
  const animal = animals.find(a => a.id === event?.animalId)

  const status = event ? getCareStatus(event.dueDate) : null
  const isComplete = !!event?.completedDate

  const onComplete = async () => {
    if (!event) return
    await bsCareService.completeCareEvent(event)
    navigation.goBack()
  }

  const onBack = () => navigation.goBack()

  return { event, animal, status, isComplete, onComplete, onBack }
}
