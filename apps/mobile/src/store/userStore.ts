import { create } from 'zustand'
import { IResult } from '../util/Result'
import User from '../schema/user/User'
import { bsAuthService, bsUserService } from '../Bootstrap'

interface UserState {
  user: User | null
  loading: boolean
  unsubscribe: (() => void) | null
  subscribe: () => void
  teardown: () => void
  updateUser: (updates: Partial<User>) => Promise<IResult>
  clear: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  unsubscribe: null,

  subscribe: () => {
    get().teardown()
    set({ loading: true })
    const userId = bsAuthService.currentUserId
    const unsub = bsUserService.subscribeUser(userId, (user) => {
      set({ user, loading: false })
    })
    set({ unsubscribe: unsub })
  },

  teardown: () => {
    const unsub = get().unsubscribe
    if (unsub) unsub()
    set({ unsubscribe: null })
  },

  updateUser: async (updates: Partial<User>) => {
    const current = get().user
    if (!current) return { success: false, error: 'No user loaded' }
    return bsUserService.updateUser({ ...current, ...updates })
  },

  clear: () => {
    get().teardown()
    set({ user: null, loading: true, unsubscribe: null })
  },
}))
