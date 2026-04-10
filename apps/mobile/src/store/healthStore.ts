import { create } from 'zustand'
import HealthRecord from '../schema/health/HealthRecord'
import { bsHealthService } from '../Bootstrap'

interface HealthStoreState {
  healthRecords: HealthRecord[]
  withdrawalRecords: HealthRecord[]
  loading: boolean

  fetchHealthRecordsByAnimal: (animalId: string) => Promise<void>
  fetchAllWithdrawalRecords: () => Promise<void>
  clear: () => void
}

export const useHealthStore = create<HealthStoreState>((set) => ({
  healthRecords: [],
  withdrawalRecords: [],
  loading: false,

  fetchHealthRecordsByAnimal: async (animalId) => {
    set({ loading: true })
    const records = await bsHealthService.fetchHealthRecordsByAnimal(animalId)
    set({ healthRecords: records, loading: false })
  },

  fetchAllWithdrawalRecords: async () => {
    const records = await bsHealthService.fetchAllWithdrawalRecords()
    set({ withdrawalRecords: records })
  },

  clear: () => set({ healthRecords: [], withdrawalRecords: [], loading: false }),
}))
