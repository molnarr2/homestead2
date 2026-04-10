import { create } from 'zustand'
import { IResult } from '../util/Result'
import ProductionLog from '../schema/production/ProductionLog'
import { bsProductionService } from '../Bootstrap'
import { parseISO, isWithinInterval } from 'date-fns'

interface ProductionState {
  productionLogs: ProductionLog[]
  loading: boolean
  fetchByDateRange: (startDate: Date, endDate: Date) => Promise<void>
  fetchByAnimal: (animalId: string) => Promise<void>
  createProductionLog: (log: ProductionLog) => Promise<IResult>
  clear: () => void
}

export const useProductionStore = create<ProductionState>((set) => ({
  productionLogs: [],
  loading: false,

  fetchByDateRange: async (startDate: Date, endDate: Date) => {
    set({ loading: true })
    const allLogs = await bsProductionService.getProductionLogs()
    const productionLogs = allLogs.filter(log => {
      const logDate = parseISO(log.date)
      return isWithinInterval(logDate, { start: startDate, end: endDate })
    })
    set({ productionLogs, loading: false })
  },

  fetchByAnimal: async (animalId: string) => {
    set({ loading: true })
    const productionLogs = await bsProductionService.getProductionLogsForAnimal(animalId)
    set({ productionLogs, loading: false })
  },

  createProductionLog: (log: ProductionLog) => bsProductionService.createProductionLog(log),

  clear: () => {
    set({ productionLogs: [], loading: false })
  },
}))
