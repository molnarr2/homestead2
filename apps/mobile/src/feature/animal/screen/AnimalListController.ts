import { useState, useMemo, useCallback } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalStore } from '../../../store/animalStore'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'
import { useGroupStore } from '../../../store/groupStore'
import Animal, { AnimalState } from '../../../schema/animal/Animal'
import AnimalGroup from '../../../schema/animalGroup/AnimalGroup'

type Navigation = NativeStackNavigationProp<RootStackParamList>

export interface AnimalSection {
  title: string
  data: (Animal | AnimalGroup)[]
  isGroupSection?: boolean
}

export function useAnimalListController(navigation: Navigation) {
  const { animals, loading } = useAnimalStore()
  const { animalTypes } = useAnimalTypeStore()
  const { groups } = useGroupStore()
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

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups
    const query = searchQuery.toLowerCase()
    return groups.filter(g => g.name.toLowerCase().includes(query))
  }, [groups, searchQuery])

  const sections = useMemo((): AnimalSection[] => {
    const result: AnimalSection[] = []

    if (!filterStates?.length && !filterTypes?.length) {
      result.push({ title: 'Groups', data: filteredGroups, isGroupSection: true })
    }

    const grouped: Record<string, Animal[]> = {}
    for (const animal of filteredAnimals) {
      const key = animal.animalType || 'Other'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(animal)
    }
    const animalSections = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }))

    result.push(...animalSections)
    return result
  }, [filteredAnimals, filteredGroups, filterStates, filterTypes])

  const onAnimalPress = (animalId: string) => navigation.navigate('AnimalDetail', { animalId })
  const onGroupPress = (groupId: string) => navigation.navigate('GroupDetail', { groupId })
  const onCreateAnimal = () => navigation.navigate('CreateAnimal', {})

  return {
    sections,
    groups,
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
    onGroupPress,
    onCreateAnimal,
  }
}
