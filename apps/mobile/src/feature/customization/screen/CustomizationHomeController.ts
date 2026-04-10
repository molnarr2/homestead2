import { useState, useEffect } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { bsAnimalTypeService } from '../../../Bootstrap'
import AnimalType from '../../../schema/animalType/AnimalType'

type Navigation = NativeStackNavigationProp<RootStackParamList>

export function useCustomizationHomeController(navigation: Navigation) {
  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = bsAnimalTypeService.subscribeToAnimalTypes((types) => {
      setAnimalTypes(types)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const onAnimalTypePress = (typeId: string) =>
    navigation.navigate('CustomizeAnimalType', { animalTypeId: typeId })
  const onCreateAnimalType = () => navigation.navigate('EditAnimalType', {})

  return { animalTypes, loading, onAnimalTypePress, onCreateAnimalType }
}
