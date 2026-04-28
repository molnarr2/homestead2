import { create } from 'zustand'
import { IResult } from '../util/Result'
import WeightLog from '../schema/weight/WeightLog'
import { bsWeightService } from '../Bootstrap'

interface WeightState {
  weightLogs: WeightLog[]
  loading: boolean
  unsubscribe: (() => void) | null
  subscribe: () => void
  teardown: () => void
  createWeightLog: (log: WeightLog) => Promise<IResult>
  clear: () => void
}

export const useWeightStore = create<WeightState>((set, get) => ({
  weightLogs: [],
  loading: true,
  unsubscribe: null,

  subscribe: () => {
    get().teardown()
    set({ loading: true })
    const unsub = bsWeightService.subscribeWeightLogs((weightLogs) => {
      set({ weightLogs, loading: false })
    })
    set({ unsubscribe: unsub })
  },

  teardown: () => {
    const unsub = get().unsubscribe
    if (unsub) unsub()
    set({ unsubscribe: null })
  },

  createWeightLog: (log: WeightLog) => bsWeightService.createWeightLog(log),

  clear: () => {
    get().teardown()
    set({ weightLogs: [], loading: true, unsubscribe: null })
  },
}))
