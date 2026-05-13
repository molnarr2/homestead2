import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalStore } from '../../../store/animalStore'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'
import { bsAnimalService, bsGroupService } from '../../../Bootstrap'
import { AnimalGender, AnimalState } from '../../../schema/animal/Animal'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditAnimal'>
type Route = RouteProp<RootStackParamList, 'EditAnimal'>

export function useEditAnimalController(navigation: Navigation, route: Route) {
  const { animalId } = route.params
  const { animals } = useAnimalStore()
  const animal = animals.find(a => a.id === animalId)
  const { animalTypes } = useAnimalTypeStore()

  const [name, setName] = useState('')
  const [animalTypeId, setAnimalTypeId] = useState('')
  const [breedId, setBreedId] = useState('')
  const [birthday, setBirthday] = useState('')
  const [gender, setGender] = useState<AnimalGender>('unknown')
  const [color, setColor] = useState('')
  const [register, setRegister] = useState('')
  const [state, setState] = useState<AnimalState>('own')
  const [photoUri, setPhotoUri] = useState('')
  const [sireId, setSireId] = useState('')
  const [damId, setDamId] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (animal && !initialized) {
      setName(animal.name)
      setAnimalTypeId(animal.animalTypeId)
      setBreedId(animal.animalBreedId)
      setBirthday(animal.birthday)
      setGender(animal.gender)
      setColor(animal.color)
      setRegister(animal.register)
      setState(animal.state)
      setSireId(animal.sireId)
      setDamId(animal.damId)
      setInitialized(true)
    }
  }, [animal, initialized])

  const selectedType = animalTypes.find(t => t.id === animalTypeId)
  const availableBreeds = selectedType?.breeds ?? []

  const onSelectAnimalType = (typeId: string) => {
    setAnimalTypeId(typeId)
    setBreedId('')
    setSireId('')
    setDamId('')
  }

  const submit = async () => {
    if (!animal) return
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a name for the animal.')
      return
    }

    setLoading(true)
    const selectedBreed = availableBreeds.find(b => b.id === breedId)
    const updated = {
      ...animal,
      name: name.trim(),
      animalType: selectedType?.name ?? animal.animalType,
      animalTypeId,
      breed: selectedBreed?.name ?? '',
      animalBreedId: breedId,
      birthday,
      gender,
      color,
      register,
      state,
      sireId,
      damId,
      admin: adminObject_updateLastUpdated(animal.admin),
    }

    if (photoUri) {
      const photoResult = await bsAnimalService.uploadAnimalPhoto(animal.id, photoUri)
      if (photoResult) {
        updated.photoUrl = photoResult.url
        updated.photoStorageRef = photoResult.ref
      }
    }

    const result = await bsAnimalService.updateAnimal(updated)
    setLoading(false)
    if (result.success) {
      navigation.goBack()
    } else {
      Alert.alert('Error', result.error)
    }
  }

  const onDelete = () => {
    Alert.alert(
      'Delete Animal',
      `Are you sure you want to delete ${animal?.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            const result = await bsAnimalService.deleteAnimal(animalId)
            if (result.success) {
              await bsGroupService.removeAnimalFromAllGroups(animalId)
              setLoading(false)
              navigation.pop(2)
            } else {
              setLoading(false)
              Alert.alert('Error', result.error)
            }
          },
        },
      ]
    )
  }

  const onBack = () => navigation.goBack()

  return {
    animal,
    name, setName,
    animalTypeId, onSelectAnimalType,
    breedId, setBreedId,
    birthday, setBirthday,
    gender, setGender,
    color, setColor,
    register, setRegister,
    state, setState,
    photoUri, setPhotoUri,
    sireId, setSireId,
    damId, setDamId,
    loading,
    animalTypes,
    availableBreeds,
    submit,
    onDelete,
    onBack,
  }
}
