import { create } from 'zustand'
import { IResult } from '../util/Result'
import ProductionLog from '../schema/production/ProductionLog'
import { bsProductionService } from '../Bootstrap'

interface ProductionState {
  productionLogs: ProductionLog[]
  loading: boolean
  fetchProductionLogs: () => Promise<void>
  fetchProductionLogsByAnimal: (animalId: string) => Promise<void>
  createProductionLog: (log: ProductionLog) => Promise<IResult>
  clear: () => void
}

export const useProductionStore = create<ProductionState>((set) => ({
  productionLogs: [],
  loading: false,

  fetchProductionLogs: async () => {
    set({ loading: true })
    const logs = await bsProductionService.getProductionLogs()
    set({ productionLogs: logs, loading: false })
  },

  fetchProductionLogsByAnimal: async (animalId: string) => {
    set({ loading: true })
    const logs = await bsProductionService.getProductionLogsForAnimal(animalId)
    set({ productionLogs: logs, loading: false })
  },

  createProductionLog: (log: ProductionLog) => bsProductionService.createProductionLog(log),

  clear: () => set({ productionLogs: [], loading: false }),
}))
