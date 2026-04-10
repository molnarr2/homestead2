import { useState, useMemo } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalStore } from '../../../store/animalStore'
import Animal, { AnimalState } from '../../../schema/animal/Animal'

type Navigation = NativeStackNavigationProp<RootStackParamList>

export type AnimalStateFilter = AnimalState | 'all'

export interface AnimalSection {
  title: string
  data: Animal[]
}

export function useAnimalListController(navigation: Navigation) {
  const { animals, loading } = useAnimalStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterState, setFilterState] = useState<AnimalStateFilter>('all')

  const filteredAnimals = useMemo(() => {
    return animals.filter(a => {
      const query = searchQuery.toLowerCase()
      const matchesSearch = !query ||
        a.name.toLowerCase().includes(query) ||
        a.breed.toLowerCase().includes(query)
      const matchesState = filterState === 'all' || a.state === filterState
      return matchesSearch && matchesState
    })
  }, [animals, searchQuery, filterState])

  const sections = useMemo((): AnimalSection[] => {
    const grouped: Record<string, Animal[]> = {}
    for (const animal of filteredAnimals) {
      const key = animal.animalType || 'Other'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(animal)
    }
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }))
  }, [filteredAnimals])

  const animalCount = filteredAnimals.length

  const onAnimalPress = (animalId: string) => navigation.navigate('AnimalDetail', { animalId })
  const onCreateAnimal = () => navigation.navigate('CreateAnimal', {})

  return {
    sections,
    animalCount,
    searchQuery,
    setSearchQuery,
    filterState,
    setFilterState,
    loading,
    onAnimalPress,
    onCreateAnimal,
  }
}
