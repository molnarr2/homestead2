import { create } from 'zustand'
import { bsAuthService } from '../Bootstrap'

interface AuthState {
  isLoggedIn: boolean | null
  userId: string
}

export const useAuthStore = create<AuthState>((set) => {
  bsAuthService.loggedIn.subscribe({
    next: (loggedIn: boolean) => {
      set({
        isLoggedIn: loggedIn,
        userId: loggedIn ? bsAuthService.currentUserId : '',
      })
    },
  })

  return {
    isLoggedIn: null,
    userId: '',
  }
})
