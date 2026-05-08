import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useWeightStore } from '../../../store/weightStore'
import { useAnimalStore } from '../../../store/animalStore'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'WeightLogDetail'>
type Route = RouteProp<RootStackParamList, 'WeightLogDetail'>

export function useWeightLogDetailController(navigation: Navigation, route: Route) {
  const { logId, animalId } = route.params
  const log = useWeightStore(s => s.weightLogs.find(l => l.id === logId))
  const animal = useAnimalStore(s => s.animals.find(a => a.id === animalId))

  const onBack = () => navigation.goBack()
  const onEdit = () => navigation.navigate('EditWeightLog', { logId, animalId })

  return { log, animal, onBack, onEdit }
}
