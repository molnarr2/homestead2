import { create } from 'zustand'
import BreedingRecord from '../schema/breeding/BreedingRecord'
import { bsBreedingService } from '../Bootstrap'

interface BreedingState {
  breedingRecords: BreedingRecord[]
  animalBreedings: BreedingRecord[]
  loading: boolean
  unsubscribe: (() => void) | null
  subscribe: () => void
  teardown: () => void
  fetchByAnimal: (animalId: string) => Promise<void>
  clear: () => void
}

export const useBreedingStore = create<BreedingState>((set, get) => ({
  breedingRecords: [],
  animalBreedings: [],
  loading: true,
  unsubscribe: null,

  subscribe: () => {
    get().teardown()
    set({ loading: true })
    const unsub = bsBreedingService.subscribe((breedingRecords) => {
      set({ breedingRecords, loading: false })
    })
    set({ unsubscribe: unsub })
  },

  teardown: () => {
    const unsub = get().unsubscribe
    if (unsub) unsub()
    set({ unsubscribe: null })
  },

  fetchByAnimal: async (animalId: string) => {
    set({ loading: true })
    const animalBreedings = await bsBreedingService.getBreedingRecordsForAnimal(animalId)
    set({ animalBreedings, loading: false })
  },

  clear: () => {
    get().teardown()
    set({ breedingRecords: [], animalBreedings: [], loading: true, unsubscribe: null })
  },
}))
