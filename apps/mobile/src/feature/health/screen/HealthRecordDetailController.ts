import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useHealthStore } from '../../../store/healthStore'
import { useAnimalStore } from '../../../store/animalStore'
import { calculateWithdrawal, WithdrawalResult } from '../../../util/WithdrawalUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'HealthRecordDetail'>
type Route = RouteProp<RootStackParamList, 'HealthRecordDetail'>

export function useHealthRecordDetailController(navigation: Navigation, route: Route) {
  const { recordId } = route.params
  const { healthRecords } = useHealthStore()
  const { animals } = useAnimalStore()
  const record = healthRecords.find(r => r.id === recordId)
  const animal = animals.find(a => a.id === record?.animalId)

  let withdrawalStatus: WithdrawalResult | null = null
  if (record && record.withdrawalPeriodDays > 0) {
    withdrawalStatus = calculateWithdrawal(record.date, record.withdrawalPeriodDays, record.withdrawalType, record.name)
  }
  if (record && record.dewormingWithdrawalDays > 0) {
    withdrawalStatus = calculateWithdrawal(record.date, record.dewormingWithdrawalDays, record.dewormingWithdrawalType, record.name)
  }

  const onBack = () => navigation.goBack()
  const onAnimalPress = () => {
    if (animal) navigation.navigate('AnimalDetail', { animalId: animal.id })
  }

  return { record, animal, withdrawalStatus, onBack, onAnimalPress }
}
