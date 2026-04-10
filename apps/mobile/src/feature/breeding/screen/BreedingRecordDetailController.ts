import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useBreedingStore } from '../../../store/breedingStore'
import { useAnimalStore } from '../../../store/animalStore'
import { calculateGestation } from '../../../util/GestationUtility'
import { bsBreedingService } from '../../../Bootstrap'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'BreedingRecordDetail'>
type Route = RouteProp<RootStackParamList, 'BreedingRecordDetail'>

export function useBreedingRecordDetailController(navigation: Navigation, route: Route) {
  const { recordId } = route.params
  const { breedingRecords } = useBreedingStore()
  const { animals } = useAnimalStore()
  const record = breedingRecords.find(r => r.id === recordId)
  const dam = animals.find(a => a.id === record?.animalId)
  const sire = record?.sireId ? animals.find(a => a.id === record.sireId) : null

  const gestationStatus = record && record.status === 'active'
    ? calculateGestation(record.breedingDate, dam?.animalType ?? '')
    : null

  const onRecordBirth = () => navigation.navigate('RecordBirthOutcome', { recordId })
  const onMarkFailed = async () => {
    await bsBreedingService.failBreeding(recordId)
    navigation.goBack()
  }

  const offspring = record?.offspringIds
    ? animals.filter(a => record.offspringIds.includes(a.id))
    : []

  const onBack = () => navigation.goBack()
  const onAnimalPress = (animalId: string) => navigation.navigate('AnimalDetail', { animalId })

  return { record, dam, sire, gestationStatus, offspring, onRecordBirth, onMarkFailed, onBack, onAnimalPress }
}
