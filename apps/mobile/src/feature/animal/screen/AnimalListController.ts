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
  const [filterStates, setFilterStates] = useState<AnimalState[]>([])
  const [filterTypes, setFilterTypes] = useState<string[]>([])

  const isFilterActive = (filterStates?.length ?? 0) > 0 || (filterTypes?.length ?? 0) > 0

  const resetFilters = useCallback(() => {
    setFilterStates([])
    setFilterTypes([])
  }, [])

  const filteredAnimals = useMemo(() => {
    return animals.filter(a => {
      const query = searchQuery.toLowerCase()
      const matchesSearch = !query ||
        a.name.toLowerCase().includes(query) ||
        a.breed.toLowerCase().includes(query)
      const matchesState = !filterStates?.length || filterStates.includes(a.state)
      const matchesType = !filterTypes?.length || filterTypes.includes(a.animalTypeId)
      return matchesSearch && matchesState && matchesType
    })
  }, [animals, searchQuery, filterStates, filterTypes])

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
    filterStates,
    setFilterStates,
    filterTypes,
    setFilterTypes,
    isFilterActive,
    resetFilters,
    animalTypes,
    loading,
    onAnimalPress,
    onCreateAnimal,
  }
}
