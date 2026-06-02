import { useState } from 'react'
import { Alert } from 'react-native'
import { bsAuthService, bsUserService, bsAnimalTypeService, bsHomesteadService } from '../../../Bootstrap'

const AVAILABLE_SPECIES = [
  { name: 'Chicken', icon: 'egg' },
  { name: 'Duck', icon: 'duck' },
  { name: 'Turkey', icon: 'turkey' },
  { name: 'Goose', icon: 'bird' },
  { name: 'Quail', icon: 'bird' },
  { name: 'Rabbit', icon: 'rabbit' },
  { name: 'Goat', icon: 'paw' },
  { name: 'Sheep', icon: 'sheep' },
  { name: 'Cattle', icon: 'cow' },
  { name: 'Pig', icon: 'pig' },
  { name: 'Horse', icon: 'horse' },
  { name: 'Alpaca', icon: 'paw' },
  { name: 'Llama', icon: 'paw' },
  { name: 'Donkey', icon: 'donkey' },
  { name: 'Dog', icon: 'dog-side' },
  { name: 'Cat', icon: 'cat' },
]

export function useSpeciesSelectionController() {
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const toggleSpecies = (species: string) => {
    setSelectedSpecies(prev =>
      prev.includes(species)
        ? prev.filter(s => s !== species)
        : [...prev, species]
    )
  }

  const complete = async () => {
    if (selectedSpecies.length === 0) return
    setLoading(true)

    const userId = bsAuthService.currentUserId
    const user = await bsUserService.getUser(userId)
    const homesteadId = user?.activeHomesteadId ?? ''

    if (homesteadId) {
      await bsAnimalTypeService.seedStarterPlaybooks(homesteadId, selectedSpecies, userId)
      await bsHomesteadService.setOnboardingComplete(homesteadId)
    }

    setLoading(false)
  }

  const skip = async () => {
    setLoading(true)
    const userId = bsAuthService.currentUserId
    const user = await bsUserService.getUser(userId)
    const homesteadId = user?.activeHomesteadId ?? ''
    if (homesteadId) {
      const result = await bsHomesteadService.setOnboardingComplete(homesteadId)
      if (!result.success) {
        Alert.alert('Error', 'Something went wrong. Please try again.')
      }
    }
    setLoading(false)
  }

  return { availableSpecies: AVAILABLE_SPECIES, selectedSpecies, toggleSpecies, loading, complete, skip }
}
