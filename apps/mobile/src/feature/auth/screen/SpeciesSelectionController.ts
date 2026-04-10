import { useState } from 'react'
import { bsAuthService, bsUserService, bsAnimalTypeService } from '../../../Bootstrap'

const AVAILABLE_SPECIES = [
  { name: 'Chicken', icon: 'egg' },
  { name: 'Duck', icon: 'duck' },
  { name: 'Turkey', icon: 'turkey' },
  { name: 'Goose', icon: 'bird' },
  { name: 'Quail', icon: 'bird' },
  { name: 'Rabbit', icon: 'rabbit' },
  { name: 'Goat', icon: 'goat' },
  { name: 'Sheep', icon: 'sheep' },
  { name: 'Cattle', icon: 'cow' },
  { name: 'Pig', icon: 'pig' },
  { name: 'Horse', icon: 'horse' },
  { name: 'Alpaca', icon: 'llama' },
  { name: 'Llama', icon: 'llama' },
  { name: 'Donkey', icon: 'donkey' },
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
    }

    setLoading(false)
  }

  const skip = async () => {
    const userId = bsAuthService.currentUserId
    await bsAnimalTypeService.skipOnboarding(userId)
  }

  return { availableSpecies: AVAILABLE_SPECIES, selectedSpecies, toggleSpecies, loading, complete, skip }
}
