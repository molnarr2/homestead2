import { create } from 'zustand'
import { bsAuthService, bsUserService, bsSubscriptionService } from '../Bootstrap'
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
        const hsId = user.activeHomesteadId ?? ''
        if (hsId) {
          useHomesteadStore.getState().setHomestead(hsId)
          subscribeAllStores()
          bsSubscriptionService.initialize().then(() => {
            bsSubscriptionService.loginRevenueCat(userId).then(() => {
              bsSubscriptionService.syncSubscription()
            })
          })
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
