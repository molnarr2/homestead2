import { create } from 'zustand'
import { IResult } from '../util/Result'
import BreedingRecord from '../schema/breeding/BreedingRecord'
import Animal from '../schema/animal/Animal'
import { bsBreedingService } from '../Bootstrap'

interface BreedingState {
  activeBreedings: BreedingRecord[]
  animalBreedings: BreedingRecord[]
  loading: boolean
  unsubscribe: (() => void) | null
  subscribeActive: () => void
  teardown: () => void
  fetchByAnimal: (animalId: string) => Promise<void>
  createBreedingRecord: (record: BreedingRecord) => Promise<IResult>
  recordBirthOutcome: (recordId: string, offspring: Animal[]) => Promise<IResult>
  failBreeding: (recordId: string) => Promise<IResult>
  clear: () => void
}

export const useBreedingStore = create<BreedingState>((set, get) => ({
  activeBreedings: [],
  animalBreedings: [],
  loading: true,
  unsubscribe: null,

  subscribeActive: () => {
    get().teardown()
    set({ loading: true })
    const unsub = bsBreedingService.subscribeActiveBreedings((activeBreedings) => {
      set({ activeBreedings, loading: false })
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

  createBreedingRecord: (record: BreedingRecord) => bsBreedingService.createBreedingRecord(record),

  recordBirthOutcome: async (recordId: string, offspring: Animal[]) => {
    const record = get().activeBreedings.find(r => r.id === recordId)
      ?? get().animalBreedings.find(r => r.id === recordId)
    if (!record) return { success: false, error: 'Breeding record not found' }
    return bsBreedingService.recordBirthOutcome(record, offspring)
  },

  failBreeding: async (recordId: string) => {
    const record = get().activeBreedings.find(r => r.id === recordId)
      ?? get().animalBreedings.find(r => r.id === recordId)
    if (!record) return { success: false, error: 'Breeding record not found' }
    return bsBreedingService.updateBreedingRecord({ ...record, status: 'failed' })
  },

  clear: () => {
    get().teardown()
    set({ activeBreedings: [], animalBreedings: [], loading: true, unsubscribe: null })
  },
}))
