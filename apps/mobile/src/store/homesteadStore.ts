import { create } from 'zustand'
import Homestead from '../schema/homestead/Homestead'
import { bsHomesteadService } from '../Bootstrap'

interface HomesteadState {
  homesteadId: string
  homestead: Homestead | null
  loading: boolean
  setHomestead: (homesteadId: string) => void
  clear: () => void
}

export const useHomesteadStore = create<HomesteadState>((set) => ({
  homesteadId: '',
  homestead: null,
  loading: false,

  setHomestead: async (homesteadId: string) => {
    set({ homesteadId, loading: true })
    const homestead = await bsHomesteadService.getHomestead(homesteadId)
    set({ homestead, loading: false })
  },

  clear: () => {
    set({ homesteadId: '', homestead: null, loading: false })
  },
}))
