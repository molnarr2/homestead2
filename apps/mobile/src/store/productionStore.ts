import { create } from 'zustand'
import { IResult } from '../util/Result'
import ProductionLog from '../schema/production/ProductionLog'
import { bsProductionService } from '../Bootstrap'

interface ProductionState {
  productionLogs: ProductionLog[]
  loading: boolean
  unsubscribe: (() => void) | null
  subscribe: () => void
  teardown: () => void
  createProductionLog: (log: ProductionLog) => Promise<IResult>
  clear: () => void
}

export const useProductionStore = create<ProductionState>((set, get) => ({
  productionLogs: [],
  loading: true,
  unsubscribe: null,

  subscribe: () => {
    get().teardown()
    set({ loading: true })
    const unsub = bsProductionService.subscribeProductionLogs((productionLogs) => {
      set({ productionLogs, loading: false })
    })
    set({ unsubscribe: unsub })
  },

  teardown: () => {
    const unsub = get().unsubscribe
    if (unsub) unsub()
    set({ unsubscribe: null })
  },

  createProductionLog: (log: ProductionLog) => bsProductionService.createProductionLog(log),

  clear: () => {
    get().teardown()
    set({ productionLogs: [], loading: true, unsubscribe: null })
  },
}))
