import { useState } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useBreedingStore } from '../../../store/breedingStore'
import { useAnimalStore } from '../../../store/animalStore'
import { bsBreedingService } from '../../../Bootstrap'
import { DamCondition } from '../../../schema/breeding/BreedingRecord'
import { todayIso } from '../../../util/DateUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'RecordBirthOutcome'>
type Route = RouteProp<RootStackParamList, 'RecordBirthOutcome'>

export function useRecordBirthOutcomeController(navigation: Navigation, route: Route) {
  const { recordId } = route.params
  const { breedingRecords } = useBreedingStore()
  const { animals } = useAnimalStore()
  const record = breedingRecords.find(r => r.id === recordId)
  const dam = animals.find(a => a.id === record?.animalId)

  const [birthDate, setBirthDate] = useState(todayIso())
  const [bornAlive, setBornAlive] = useState(1)
  const [stillborn, setStillborn] = useState(0)
  const [complications, setComplications] = useState('')
  const [damCondition, setDamCondition] = useState<DamCondition>('Good')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!dam || !record) return
    setLoading(true)
    await bsBreedingService.completeBirth(recordId, {
      birthDate, bornAlive, stillborn, complications, damCondition,
      sireId: record.sireId,
    }, dam)
    setLoading(false)
    navigation.goBack()
  }

  const onBack = () => navigation.goBack()

  return {
    record, dam, birthDate, setBirthDate, bornAlive, setBornAlive,
    stillborn, setStillborn, complications, setComplications,
    damCondition, setDamCondition, loading, submit, onBack,
  }
}
