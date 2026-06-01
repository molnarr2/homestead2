import { useState, useMemo, useCallback } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { createMMKV } from 'react-native-mmkv'
import { useAnimalStore } from '../../../store/animalStore'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'
import { useGroupStore } from '../../../store/groupStore'
import { useHomesteadStore } from '../../../store/homesteadStore'
import { usePaywallStore } from '../../../store/paywallStore'
import { useHealthStore } from '../../../store/healthStore'
import { effectiveSubscription } from '../../subscription/service/ISubscriptionService'
import { getActiveWithdrawals } from '../../../util/WithdrawalUtility'
import Animal, { AnimalState } from '../../../schema/animal/Animal'
import AnimalGroup from '../../../schema/animalGroup/AnimalGroup'

const FREE_TIER_ANIMAL_LIMIT = 12
const STANDARD_TIER_ANIMAL_LIMIT = 50

const animalListStorage = createMMKV()
const VIEW_MODE_KEY = 'animal-list-view-mode'

export type ViewMode = 'list' | 'grid'

type Navigation = NativeStackNavigationProp<RootStackParamList>

export interface AnimalSection {
  title: string
  data: (Animal | AnimalGroup)[]
  isGroupSection?: boolean
}

export type GridItem =
  | { type: 'header'; title: string; count: number }
  | { type: 'row'; animals: [Animal, Animal?] }

export function useAnimalListController(navigation: Navigation) {
  const { animals, loading } = useAnimalStore()
  const { animalTypes } = useAnimalTypeStore()
  const { groups } = useGroupStore()
  const homestead = useHomesteadStore(s => s.homestead)
  const { healthRecords } = useHealthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStates, setFilterStates] = useState<AnimalState[]>([])
  const [filterTypes, setFilterTypes] = useState<string[]>([])

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const stored = animalListStorage.getString(VIEW_MODE_KEY)
    return stored === 'grid' ? 'grid' : 'list'
  })

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => {
      const next = prev === 'list' ? 'grid' : 'list'
      animalListStorage.set(VIEW_MODE_KEY, next)
      return next
    })
  }, [])

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

    if (filteredGroups.length > 0 && !filterStates?.length && !filterTypes?.length) {
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

  const withdrawalAnimalIds = useMemo(() => {
    const byAnimal = new Map<string, typeof healthRecords>()
    for (const r of healthRecords) {
      if (!r.animalId) continue
      const arr = byAnimal.get(r.animalId)
      if (arr) arr.push(r)
      else byAnimal.set(r.animalId, [r])
    }
    const ids = new Set<string>()
    for (const [animalId, records] of byAnimal) {
      if (getActiveWithdrawals(records).length > 0) ids.add(animalId)
    }
    return ids
  }, [healthRecords])

  const gridFlatData = useMemo((): GridItem[] => {
    const result: GridItem[] = []
    for (const section of sections) {
      if (section.isGroupSection) continue
      const sectionAnimals = section.data as Animal[]
      result.push({ type: 'header', title: section.title, count: sectionAnimals.length })
      for (let i = 0; i < sectionAnimals.length; i += 2) {
        result.push({
          type: 'row',
          animals: i + 1 < sectionAnimals.length
            ? [sectionAnimals[i], sectionAnimals[i + 1]]
            : [sectionAnimals[i]],
        })
      }
    }
    return result
  }, [sections])

  const onAnimalPress = (animalId: string) => navigation.navigate('AnimalDetail', { animalId })
  const onGroupPress = (groupId: string) => navigation.navigate('GroupDetail', { groupId })
  const onCreateAnimal = () => {
    const tier = effectiveSubscription(homestead)
    const count = animals.length
    if (
      (tier === 'free' && count >= FREE_TIER_ANIMAL_LIMIT) ||
      (tier === 'standard' && count >= STANDARD_TIER_ANIMAL_LIMIT)
    ) {
      usePaywallStore.getState().show()
      return
    }
    navigation.navigate('CreateAnimal', {})
  }

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
    viewMode,
    toggleViewMode,
    withdrawalAnimalIds,
    gridFlatData,
    onAnimalPress,
    onGroupPress,
    onCreateAnimal,
  }
}
