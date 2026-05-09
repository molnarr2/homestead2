import { useState } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useBreedingStore } from '../../../store/breedingStore'
import { useAnimalStore } from '../../../store/animalStore'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'
import { bsBreedingService } from '../../../Bootstrap'
import { BreedingMethod } from '../../../schema/breeding/BreedingRecord'
import { calculateGestation } from '../../../util/GestationUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditBreedingRecord'>
type Route = RouteProp<RootStackParamList, 'EditBreedingRecord'>

export function useEditBreedingRecordController(navigation: Navigation, route: Route) {
  const { recordId } = route.params
  const record = useBreedingStore(s => s.breedingRecords.find(r => r.id === recordId))
  const { animals } = useAnimalStore()
  const { getGestationDays } = useAnimalTypeStore()

  const dam = animals.find(a => a.id === record?.animalId)

  const [sireId, setSireId] = useState(record?.sireId ?? '')
  const [sireName, setSireName] = useState(record?.sireName ?? '')
  const [breedingDate, setBreedingDate] = useState(record?.breedingDate ?? '')
  const [method, setMethod] = useState<BreedingMethod>(record?.method ?? 'natural')
  const [notes, setNotes] = useState(record?.notes ?? '')
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
    if (!record) return

    setLoading(true)
    const updated = {
      ...record,
      sireId,
      sireName,
      breedingDate,
      expectedDueDate: gestationStatus?.expectedDueDate ?? record.expectedDueDate,
      method,
      notes,
    }
    const result = await bsBreedingService.updateBreedingRecord(updated)
    setLoading(false)
    if (result.success) {
      navigation.goBack()
    } else {
      Alert.alert('Error', result.error)
    }
  }

  const onBack = () => navigation.goBack()

  const selectedAnimal = dam ?? null

  return {
    record, dam, selectedAnimal, sireId, sireName, onSireSelect, onManualSireNameChange,
    breedingDate, setBreedingDate,
    method, setMethod, notes, setNotes, gestationStatus, gestationDays,
    loading, submit, animals, onBack,
  }
}
