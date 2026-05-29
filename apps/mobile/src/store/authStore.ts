import { create } from 'zustand'
import { bsAuthService, bsUserService } from '../Bootstrap'
import { initializeApp, teardownApp } from './appInitializer'

interface AuthState {
  isLoggedIn: boolean | null
  userId: string
}

export const useAuthStore = create<AuthState>((set) => {
  bsAuthService.loggedIn.subscribe({
    next: async (loggedIn: boolean) => {
      if (loggedIn) {
        const userId = bsAuthService.currentUserId
        set({ isLoggedIn: true, userId })
        const user = await bsUserService.getUser(userId)
        if (!user) return
        const hsId = user.activeHomesteadId ?? ''
        if (hsId) {
          initializeApp(userId, hsId)
        }
      } else {
        teardownApp()
        set({ isLoggedIn: false, userId: '' })
      }
    },
  })

  return {
    isLoggedIn: null,
    userId: '',
  }
})
