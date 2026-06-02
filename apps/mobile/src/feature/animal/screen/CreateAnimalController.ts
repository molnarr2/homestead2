import { useState } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'
import { useAnimalStore } from '../../../store/animalStore'
import { useUserStore } from '../../../store/userStore'
import { useCreateAccountPromptStore } from '../../../store/createAccountPromptStore'
import { bsAnimalService } from '../../../Bootstrap'
import { animal_default, AnimalGender } from '../../../schema/animal/Animal'
import { adminObject_default } from '../../../schema/object/AdminObject'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateAnimal'>
type Route = RouteProp<RootStackParamList, 'CreateAnimal'>

const ANONYMOUS_THRESHOLDS = [3, 6, 10]

export function useCreateAnimalController(navigation: Navigation, route: Route) {
  const { animalTypes } = useAnimalTypeStore()

  const [name, setName] = useState('')
  const [animalTypeId, setAnimalTypeId] = useState(route.params?.animalTypeId ?? '')
  const [breedId, setBreedId] = useState('')
  const [birthday, setBirthday] = useState('')
  const [gender, setGender] = useState<AnimalGender>('unknown')
  const [color, setColor] = useState('')
  const [register, setRegister] = useState('')
  const [photoUri, setPhotoUri] = useState('')
  const [sireId, setSireId] = useState('')
  const [damId, setDamId] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedType = animalTypes.find(t => t.id === animalTypeId)
  const availableBreeds = selectedType?.breeds ?? []

  const onSelectAnimalType = (typeId: string) => {
    setAnimalTypeId(typeId)
    setBreedId('')
    setSireId('')
    setDamId('')
  }

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a name for the animal.')
      return
    }

    setLoading(true)
    const selectedBreed = availableBreeds.find(b => b.id === breedId)
    const animal = {
      ...animal_default(),
      name: name.trim(),
      animalType: selectedType?.name ?? '',
      animalTypeId,
      animalTypeLevel: '',
      breed: selectedBreed?.name ?? '',
      animalBreedId: breedId,
      birthday,
      gender,
      color,
      register,
      sireId,
      damId,
      state: 'own' as const,
      admin: adminObject_default(),
    }

    const result = await bsAnimalService.createAnimal(animal)

    if (result.success && photoUri) {
      const photoResult = await bsAnimalService.uploadAnimalPhoto(animal.id, photoUri)
      if (photoResult) {
        await bsAnimalService.updateAnimal({
          ...animal,
          photoUrl: photoResult.url,
          photoStorageRef: photoResult.ref,
        })
      } else {
        Alert.alert('Photo Error', 'Animal was saved but the photo failed to upload. You can add it later from the edit screen.')
      }
    }

    setLoading(false)
    if (result.success) {
      const currentUser = useUserStore.getState().user
      if (currentUser?.anonymous) {
        const ownedCount = useAnimalStore.getState().animals.filter(a => a.state === 'own').length
        const lastSeen = currentUser.anonymousPromptLastSeen ?? 0
        for (const threshold of ANONYMOUS_THRESHOLDS) {
          if (ownedCount >= threshold && lastSeen < threshold) {
            useCreateAccountPromptStore.getState().show(threshold)
            break
          }
        }
      }
      navigation.goBack()
    } else {
      Alert.alert('Error', result.error)
    }
  }

  const onBack = () => navigation.goBack()

  return {
    name, setName,
    animalTypeId, onSelectAnimalType,
    breedId, setBreedId,
    birthday, setBirthday,
    gender, setGender,
    color, setColor,
    register, setRegister,
    photoUri, setPhotoUri,
    sireId, setSireId,
    damId, setDamId,
    loading,
    animalTypes,
    availableBreeds,
    selectedType,
    submit,
    onBack,
  }
}
