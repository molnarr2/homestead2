import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalStore } from '../../../store/animalStore'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'
import { useUserStore } from '../../../store/userStore'
import { bsAnimalService, bsSubscriptionService } from '../../../Bootstrap'
import { animal_default, AnimalGender } from '../../../schema/animal/Animal'
import { adminObject_default } from '../../../schema/object/AdminObject'
import Breed from '../../../schema/animalType/Breed'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateAnimal'>
type Route = RouteProp<RootStackParamList, 'CreateAnimal'>

const FREE_TIER_ANIMAL_LIMIT = 10

export function useCreateAnimalController(navigation: Navigation, route: Route) {
  const { animals } = useAnimalStore()
  const { animalTypes, breeds, fetchBreeds } = useAnimalTypeStore()
  const user = useUserStore(s => s.user)

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
  const availableBreeds: Breed[] = animalTypeId ? (breeds[animalTypeId] ?? []) : []

  useEffect(() => {
    if (animalTypeId) {
      fetchBreeds(animalTypeId)
      setBreedId('')
    }
  }, [animalTypeId])

  const onSelectAnimalType = (typeId: string) => {
    setAnimalTypeId(typeId)
    setSireId('')
    setDamId('')
  }

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a name for the animal.')
      return
    }

    const tier = user?.subscription ?? 'free'
    if (tier === 'free' && animals.length >= FREE_TIER_ANIMAL_LIMIT) {
      Alert.alert(
        'Animal Limit Reached',
        `Free accounts can add up to ${FREE_TIER_ANIMAL_LIMIT} animals. Upgrade to Pro for unlimited animals.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
        ]
      )
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
      }
    }

    setLoading(false)
    if (result.success) {
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
