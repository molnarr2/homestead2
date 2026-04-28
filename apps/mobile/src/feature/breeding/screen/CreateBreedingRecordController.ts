import { useState } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalStore } from '../../../store/animalStore'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'
import { useHomesteadStore } from '../../../store/homesteadStore'
import { effectiveSubscription } from '../../subscription/service/ISubscriptionService'
import { bsBreedingService } from '../../../Bootstrap'
import { breedingRecord_default, BreedingMethod } from '../../../schema/breeding/BreedingRecord'
import { calculateGestation } from '../../../util/GestationUtility'
import { todayIso } from '../../../util/DateUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateBreedingRecord'>
type Route = RouteProp<RootStackParamList, 'CreateBreedingRecord'>

export function useCreateBreedingRecordController(navigation: Navigation, route: Route) {
  const { animalId } = route.params
  const { animals } = useAnimalStore()
  const { getGestationDays } = useAnimalTypeStore()
  const homestead = useHomesteadStore(s => s.homestead)

  const dam = animals.find(a => a.id === animalId)

  const [sireId, setSireId] = useState('')
  const [sireName, setSireName] = useState('')
  const [breedingDate, setBreedingDate] = useState(todayIso())
  const [method, setMethod] = useState<BreedingMethod>('natural')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const gestationDays = dam ? getGestationDays(dam.animalTypeId, dam.animalBreedId) : 0
  const gestationStatus = breedingDate && gestationDays > 0
    ? calculateGestation(breedingDate, dam?.animalType ?? '', gestationDays)
    : null

  const onSireSelect = (id: string) => {
    setSireId(id)
    const sire = animals.find(a => a.id === id)
    setSireName(sire ? sire.name : '')
  }

  const onManualSireNameChange = (name: string) => {
    setSireId('')
    setSireName(name)
  }

  const submit = async () => {
    const tier = effectiveSubscription(homestead)
    if (tier === 'free') {
      Alert.alert(
        'Pro Feature',
        'Breeding records are available with a Pro or Farm subscription. Upgrade to track breedings, gestation countdowns, and offspring.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
        ]
      )
      return
    }

    setLoading(true)
    const record = {
      ...breedingRecord_default(),
      animalId,
      sireId,
      sireName,
      breedingDate,
      expectedDueDate: gestationStatus?.expectedDueDate ?? '',
      method,
      notes,
      status: 'active' as const,
    }
    await bsBreedingService.createBreedingRecord(record)
    setLoading(false)
    navigation.goBack()
  }

  const onBack = () => navigation.goBack()

  return {
    dam, sireId, sireName, onSireSelect, onManualSireNameChange,
    breedingDate, setBreedingDate,
    method, setMethod, notes, setNotes, gestationStatus, gestationDays,
    loading, submit, animals, onBack,
  }
}
