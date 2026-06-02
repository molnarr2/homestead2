import { useHomesteadStore } from './homesteadStore'
import { subscribeAllStores, resetAllStores } from './resetAllStores'
import { bsSubscriptionService, bsHomesteadService } from '../Bootstrap'

let initialized = false

export function initializeApp(userId: string, homesteadId: string) {
  if (initialized) return
  initialized = true
  useHomesteadStore.getState().setHomestead(homesteadId)
  subscribeAllStores()
  bsHomesteadService.updateLastActiveIfNeeded(homesteadId)
  bsSubscriptionService.initialize().then(() => {
    bsSubscriptionService.loginRevenueCat(userId).then(() => {
      bsSubscriptionService.syncSubscription()
    })
  })
}

export function teardownApp() {
  initialized = false
  resetAllStores()
}
