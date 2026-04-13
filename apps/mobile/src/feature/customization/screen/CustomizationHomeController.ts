import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'

type Navigation = NativeStackNavigationProp<RootStackParamList>

export function useCustomizationHomeController(navigation: Navigation) {
  const animalTypes = useAnimalTypeStore(s => s.animalTypes)
  const loading = useAnimalTypeStore(s => s.loading)

  const onAnimalTypePress = (typeId: string) =>
    navigation.navigate('CustomizeAnimalType', { animalTypeId: typeId })
  const onCreateAnimalType = () => navigation.navigate('EditAnimalType', {})

  return { animalTypes, loading, onAnimalTypePress, onCreateAnimalType }
}
