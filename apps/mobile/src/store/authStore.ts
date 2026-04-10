import { create } from 'zustand'
import { bsAuthService } from '../Bootstrap'

interface AuthState {
  isLoggedIn: boolean | null
  userId: string
  initialize: () => () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: null,
  userId: '',

  initialize: () => {
    const subscription = bsAuthService.loggedIn.subscribe({
      next: (loggedIn: boolean) => {
        set({
          isLoggedIn: loggedIn,
          userId: loggedIn ? bsAuthService.currentUserId : '',
        })
      },
    })
    return () => subscription.unsubscribe()
  },
}))
