import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CustomizeAnimalType'>
type Route = RouteProp<RootStackParamList, 'CustomizeAnimalType'>

export function useAnimalTypeDetailController(navigation: Navigation, route: Route) {
  const { animalTypeId } = route.params
  const { animalTypes, loading } = useAnimalTypeStore()

  const animalType = animalTypes.find(t => t.id === animalTypeId) ?? null
  const breeds = animalType?.breeds ?? []
  const careTemplates = animalType?.careTemplates ?? []

  const onEditType = () => navigation.navigate('EditAnimalType', { animalTypeId })
  const onAddBreed = () => navigation.navigate('EditBreed', { animalTypeId })
  const onEditBreed = (breedId: string) =>
    navigation.navigate('EditBreed', { animalTypeId, breedId })
  const onAddCareTemplate = () => navigation.navigate('EditCareTemplate', { animalTypeId })
  const onEditCareTemplate = (templateId: string) =>
    navigation.navigate('EditCareTemplate', { animalTypeId, templateId })
  const onBack = () => navigation.goBack()

  return {
    animalType, breeds, careTemplates, loading,
    onEditType, onAddBreed, onEditBreed, onAddCareTemplate, onEditCareTemplate,
    onBack,
  }
}
