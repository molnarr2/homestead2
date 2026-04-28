import { create } from 'zustand'
import HealthRecord from '../schema/health/HealthRecord'
import { bsHealthService } from '../Bootstrap'

interface HealthStoreState {
  healthRecords: HealthRecord[]
  loading: boolean
  unsubscribe: (() => void) | null
  subscribe: () => void
  teardown: () => void
  clear: () => void
}

export const useHealthStore = create<HealthStoreState>((set, get) => ({
  healthRecords: [],
  loading: true,
  unsubscribe: null,

  subscribe: () => {
    get().teardown()
    set({ loading: true })
    const unsub = bsHealthService.subscribeHealthRecords((healthRecords) => {
      set({ healthRecords, loading: false })
    })
    set({ unsubscribe: unsub })
  },

  teardown: () => {
    const unsub = get().unsubscribe
    if (unsub) unsub()
    set({ unsubscribe: null })
  },

  clear: () => {
    get().teardown()
    set({ healthRecords: [], loading: true, unsubscribe: null })
  },
}))
