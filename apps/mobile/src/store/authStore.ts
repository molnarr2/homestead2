import { create } from 'zustand'
import { bsAuthService, bsUserService, bsHomesteadService } from '../Bootstrap'
import { useHomesteadStore } from './homesteadStore'
import { subscribeAllStores, resetAllStores } from './resetAllStores'

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
        let hsId = user.activeHomesteadId ?? ''
        if (!hsId) {
          const displayName = `${user.firstName} ${user.lastName}`.trim()
          hsId = await bsHomesteadService.createHomestead('My Homestead', userId, displayName, user.email)
          if (hsId) {
            await bsUserService.setActiveHomestead(userId, hsId)
          }
        }
        if (hsId) {
          useHomesteadStore.getState().setHomestead(hsId)
          subscribeAllStores()
        }
      } else {
        resetAllStores()
        set({ isLoggedIn: false, userId: '' })
      }
    },
  })

  return {
    isLoggedIn: null,
    userId: '',
  }
})
