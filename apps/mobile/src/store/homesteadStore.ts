import { create } from 'zustand'
import Homestead from '../schema/homestead/Homestead'
import type { HomesteadRole } from '../schema/homestead/HomesteadMember'
import { bsHomesteadService, bsAuthService } from '../Bootstrap'

interface HomesteadState {
  homesteadId: string
  homestead: Homestead | null
  userRole: HomesteadRole | null
  loading: boolean
  unsubscribe: (() => void) | null
  setHomestead: (homesteadId: string) => void
  clear: () => void
}

export const useHomesteadStore = create<HomesteadState>((set, get) => ({
  homesteadId: '',
  homestead: null,
  userRole: null,
  loading: false,
  unsubscribe: null,

  setHomestead: (homesteadId: string) => {
    const prev = get().unsubscribe
    if (prev) prev()

    set({ homesteadId, loading: true })

    const unsub = bsHomesteadService.subscribeHomestead(homesteadId, (homestead) => {
      set({ homestead, loading: false })
    })
    set({ unsubscribe: unsub })

    const userId = bsAuthService.currentUserId
    if (userId) {
      bsHomesteadService.getMemberRole(homesteadId, userId).then(role => {
        set({ userRole: role })
      })
    }
  },

  clear: () => {
    const unsub = get().unsubscribe
    if (unsub) unsub()
    set({ homesteadId: '', homestead: null, userRole: null, loading: false, unsubscribe: null })
  },
}))
