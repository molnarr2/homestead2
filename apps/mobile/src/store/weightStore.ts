import { create } from 'zustand'
import { IResult } from '../util/Result'
import WeightLog from '../schema/weight/WeightLog'
import { bsWeightService } from '../Bootstrap'

interface WeightState {
  weightLogs: WeightLog[]
  loading: boolean
  fetchByAnimal: (animalId: string) => Promise<void>
  createWeightLog: (log: WeightLog) => Promise<IResult>
  clear: () => void
}

export const useWeightStore = create<WeightState>((set) => ({
  weightLogs: [],
  loading: false,

  fetchByAnimal: async (animalId: string) => {
    set({ loading: true })
    const weightLogs = await bsWeightService.getWeightLogsForAnimal(animalId)
    set({ weightLogs, loading: false })
  },

  createWeightLog: (log: WeightLog) => bsWeightService.createWeightLog(log),

  clear: () => {
    set({ weightLogs: [], loading: false })
  },
}))
