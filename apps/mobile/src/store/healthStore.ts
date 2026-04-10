import { create } from 'zustand'
import { IResult } from '../util/Result'
import HealthRecord from '../schema/health/HealthRecord'
import { bsHealthService } from '../Bootstrap'

interface HealthState {
  healthRecords: HealthRecord[]
  activeWithdrawals: HealthRecord[]
  loading: boolean
  fetchByAnimal: (animalId: string) => Promise<void>
  fetchActiveWithdrawals: () => Promise<void>
  createHealthRecord: (record: HealthRecord) => Promise<IResult>
  clear: () => void
}

export const useHealthStore = create<HealthState>((set) => ({
  healthRecords: [],
  activeWithdrawals: [],
  loading: false,

  fetchByAnimal: async (animalId: string) => {
    set({ loading: true })
    const healthRecords = await bsHealthService.getHealthRecordsForAnimal(animalId)
    set({ healthRecords, loading: false })
  },

  fetchActiveWithdrawals: async () => {
    const activeWithdrawals = await bsHealthService.getActiveWithdrawalRecords()
    set({ activeWithdrawals })
  },

  createHealthRecord: (record: HealthRecord) => bsHealthService.createHealthRecord(record),

  clear: () => {
    set({ healthRecords: [], activeWithdrawals: [], loading: false })
  },
}))
