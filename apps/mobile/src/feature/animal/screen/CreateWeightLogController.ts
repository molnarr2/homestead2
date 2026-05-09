import { useState } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalStore } from '../../../store/animalStore'
import { bsWeightService } from '../../../Bootstrap'
import { weightLog_default } from '../../../schema/weight/WeightLog'
import { todayIso } from '../../../util/DateUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateWeightLog'>
type Route = RouteProp<RootStackParamList, 'CreateWeightLog'>

export function useCreateWeightLogController(navigation: Navigation, route: Route) {
  const { animalId } = route.params
  const { animals } = useAnimalStore()

  const animal = animals.find(a => a.id === animalId)

  const [date, setDate] = useState(todayIso())
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs')
  const [bodyConditionScore, setBodyConditionScore] = useState(3)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    const parsed = parseFloat(weight)
    if (!date || isNaN(parsed) || parsed <= 0) {
      Alert.alert('Validation', 'Please enter a valid date and weight greater than 0.')
      return
    }

    setLoading(true)
    const log = {
      ...weightLog_default(),
      animalId,
      date,
      weight: parsed,
      weightUnit,
      bodyConditionScore,
      notes,
    }
    await bsWeightService.createWeightLog(log)
    setLoading(false)
    navigation.goBack()
  }

  const onBack = () => navigation.goBack()

  const selectedAnimal = animal ?? null

  return {
    animal, selectedAnimal, date, setDate, weight, setWeight,
    weightUnit, setWeightUnit, bodyConditionScore, setBodyConditionScore,
    notes, setNotes, loading, submit, onBack,
  }
}
