import { create } from 'zustand'
import { bsAuthService, bsUserService } from '../Bootstrap'
import { initializeApp, teardownApp } from './appInitializer'
import type { V1User } from '../feature/user/service/IUserService'

interface AuthState {
  isLoggedIn: boolean | null
  userId: string
  migrationUser: V1User | null
  clearMigration: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  bsAuthService.loggedIn.subscribe({
    next: async (loggedIn: boolean) => {
      if (loggedIn) {
        const userId = bsAuthService.currentUserId
        set({ isLoggedIn: true, userId })
        const user = await bsUserService.getUser(userId)
        if (user) {
          const hsId = user.activeHomesteadId ?? ''
          if (hsId) {
            initializeApp(userId, hsId)
          } else {
            const v1User = await bsUserService.getV1User(userId)
            if (v1User) {
              set({ migrationUser: { firstName: user.firstName, lastName: user.lastName, email: user.email, anonymous: user.anonymous } })
            }
          }
          return
        }
        const v1User = await bsUserService.getV1User(userId)
        if (v1User) {
          set({ migrationUser: v1User })
          return
        }
      } else {
        teardownApp()
        set({ isLoggedIn: false, userId: '', migrationUser: null })
      }
    },
  })

  return {
    isLoggedIn: null,
    userId: '',
    migrationUser: null,
    clearMigration: () => set({ migrationUser: null }),
  }
})
