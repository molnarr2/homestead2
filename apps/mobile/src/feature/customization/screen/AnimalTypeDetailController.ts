import { useState, useEffect } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { bsAnimalTypeService } from '../../../Bootstrap'
import AnimalType from '../../../schema/animalType/AnimalType'
import Breed from '../../../schema/animalType/Breed'
import CareTemplate from '../../../schema/animalType/CareTemplate'
import EventTemplate from '../../../schema/animalType/EventTemplate'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CustomizeAnimalType'>
type Route = RouteProp<RootStackParamList, 'CustomizeAnimalType'>

export function useAnimalTypeDetailController(navigation: Navigation, route: Route) {
  const { animalTypeId } = route.params
  const [animalType, setAnimalType] = useState<AnimalType | null>(null)
  const [breeds, setBreeds] = useState<Breed[]>([])
  const [careTemplates, setCareTemplates] = useState<CareTemplate[]>([])
  const [eventTemplates, setEventTemplates] = useState<EventTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [animalTypeId])

  const loadData = async () => {
    setLoading(true)
    const type = await bsAnimalTypeService.fetchAnimalType(animalTypeId)
    setAnimalType(type)

    const b = await bsAnimalTypeService.getBreedsForType(animalTypeId)
    setBreeds(b)

    const ct = await bsAnimalTypeService.getCareTemplatesForType(animalTypeId)
    setCareTemplates(ct)

    const et = await bsAnimalTypeService.getEventTemplatesForType(animalTypeId)
    setEventTemplates(et)
    setLoading(false)
  }

  const onEditType = () => navigation.navigate('EditAnimalType', { animalTypeId })
  const onAddBreed = () => navigation.navigate('EditBreed', { animalTypeId })
  const onEditBreed = (breedId: string) =>
    navigation.navigate('EditBreed', { animalTypeId, breedId })
  const onAddCareTemplate = () => navigation.navigate('EditCareTemplate', { animalTypeId })
  const onEditCareTemplate = (templateId: string) =>
    navigation.navigate('EditCareTemplate', { animalTypeId, templateId })
  const onAddEventTemplate = () => navigation.navigate('EditEventTemplate', { animalTypeId })
  const onBack = () => navigation.goBack()

  return {
    animalType, breeds, careTemplates, eventTemplates, loading,
    onEditType, onAddBreed, onEditBreed, onAddCareTemplate, onEditCareTemplate,
    onAddEventTemplate, onBack, loadData,
  }
}
