import { create } from 'zustand'

interface HomesteadState {
  homesteadId: string
  setHomesteadId: (id: string) => void
}

export const useHomesteadStore = create<HomesteadState>((set) => ({
  homesteadId: '',
  setHomesteadId: (id: string) => set({ homesteadId: id }),
}))
