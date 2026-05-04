import { useState, useMemo, useCallback } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalStore } from '../../../store/animalStore'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'
import Animal, { AnimalState } from '../../../schema/animal/Animal'

type Navigation = NativeStackNavigationProp<RootStackParamList>

export interface AnimalSection {
  title: string
  data: Animal[]
}

export function useAnimalListController(navigation: Navigation) {
  const { animals, loading } = useAnimalStore()
  const { animalTypes } = useAnimalTypeStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterState, setFilterState] = useState<AnimalState | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)

  const isFilterActive = filterState !== null || filterType !== null

  const resetFilters = useCallback(() => {
    setFilterState(null)
    setFilterType(null)
  }, [])

  const filteredAnimals = useMemo(() => {
    return animals.filter(a => {
      const query = searchQuery.toLowerCase()
      const matchesSearch = !query ||
        a.name.toLowerCase().includes(query) ||
        a.breed.toLowerCase().includes(query)
      const matchesState = filterState === null || a.state === filterState
      const matchesType = filterType === null || a.animalTypeId === filterType
      return matchesSearch && matchesState && matchesType
    })
  }, [animals, searchQuery, filterState, filterType])

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

  const onAnimalPress = (animalId: string) => navigation.navigate('AnimalDetail', { animalId })
  const onCreateAnimal = () => navigation.navigate('CreateAnimal', {})

  return {
    sections,
    searchQuery,
    setSearchQuery,
    filterState,
    setFilterState,
    filterType,
    setFilterType,
    isFilterActive,
    resetFilters,
    animalTypes,
    loading,
    onAnimalPress,
    onCreateAnimal,
  }
}
