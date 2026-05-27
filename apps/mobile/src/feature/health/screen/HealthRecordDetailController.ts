import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useHealthStore } from '../../../store/healthStore'
import { useGroupStore } from '../../../store/groupStore'
import { useAnimalStore } from '../../../store/animalStore'
import { calculateWithdrawal, WithdrawalResult } from '../../../util/WithdrawalUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'HealthRecordDetail'>
type Route = RouteProp<RootStackParamList, 'HealthRecordDetail'>

export function useHealthRecordDetailController(navigation: Navigation, route: Route) {
  const { recordId, groupId } = route.params
  const { healthRecords } = useHealthStore()
  const { groupHealthRecords } = useGroupStore()
  const { animals } = useAnimalStore()

  const record = groupId
    ? (groupHealthRecords[groupId] ?? []).find(r => r.id === recordId)
    : healthRecords.find(r => r.id === recordId)

  const animal = animals.find(a => a.id === record?.animalId)

  let withdrawalStatus: WithdrawalResult | null = null
  if (record && record.medicationWithdrawalDays > 0) {
    withdrawalStatus = calculateWithdrawal(record.date, record.medicationWithdrawalDays, record.medicationWithdrawalType, record.name)
  }
  if (record && record.dewormingWithdrawalDays > 0) {
    withdrawalStatus = calculateWithdrawal(record.date, record.dewormingWithdrawalDays, record.dewormingWithdrawalType, record.name)
  }

  const onBack = () => navigation.goBack()
  const onAnimalPress = () => {
    if (animal) navigation.navigate('AnimalDetail', { animalId: animal.id })
  }
  const onEdit = () => navigation.navigate('EditHealthRecord', { recordId, groupId })

  return { record, animal, withdrawalStatus, onBack, onAnimalPress, onEdit }
}
