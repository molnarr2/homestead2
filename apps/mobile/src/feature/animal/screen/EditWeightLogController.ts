import { useState } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useWeightStore } from '../../../store/weightStore'
import { useAnimalStore } from '../../../store/animalStore'
import { bsWeightService } from '../../../Bootstrap'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditWeightLog'>
type Route = RouteProp<RootStackParamList, 'EditWeightLog'>

export function useEditWeightLogController(navigation: Navigation, route: Route) {
  const { logId, animalId } = route.params
  const log = useWeightStore(s => s.weightLogs.find(l => l.id === logId))
  const animal = useAnimalStore(s => s.animals.find(a => a.id === animalId))

  const [date, setDate] = useState(log?.date ?? '')
  const [weight, setWeight] = useState(log ? String(log.weight) : '')
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>(log?.weightUnit ?? 'lbs')
  const [bodyConditionScore, setBodyConditionScore] = useState(log?.bodyConditionScore ?? 3)
  const [notes, setNotes] = useState(log?.notes ?? '')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!log) return
    const parsed = parseFloat(weight)
    if (!date || isNaN(parsed) || parsed <= 0) {
      Alert.alert('Validation', 'Please enter a valid date and weight greater than 0.')
      return
    }

    setLoading(true)
    const updated = {
      ...log,
      date,
      weight: parsed,
      weightUnit,
      bodyConditionScore,
      notes,
    }
    const result = await bsWeightService.updateWeightLog(updated)
    setLoading(false)
    if (result.success) {
      navigation.goBack()
    } else {
      Alert.alert('Error', result.error)
    }
  }

  const onBack = () => navigation.goBack()

  const selectedAnimal = animal ?? null

  return {
    log, animal, selectedAnimal, date, setDate, weight, setWeight,
    weightUnit, setWeightUnit, bodyConditionScore, setBodyConditionScore,
    notes, setNotes, loading, submit, onBack,
  }
}
