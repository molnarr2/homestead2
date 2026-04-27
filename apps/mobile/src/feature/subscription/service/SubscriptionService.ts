import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { InAppSubscription } from '../../../core/service/purchases/IInAppPurchaseService'
import IInAppPurchases from '../../../core/plugin/IInAppPurchases'
import IUserService from '../../user/service/IUserService'
import IAuthService from '../../../core/service/auth/IAuthService'
import { effectiveSubscription } from './ISubscriptionService'
import type ISubscriptionService from './ISubscriptionService'
import type { SubscriptionTier } from './ISubscriptionService'
import Log from '../../../library/log/Log'

const TAG = 'SubscriptionService'

function revenueCatTierToSubscription(tier: InAppSubscription): SubscriptionTier {
  switch (tier) {
    case InAppSubscription.tier3:
      return 'farm'
    case InAppSubscription.tier2:
      return 'pro'
    case InAppSubscription.tier1:
      return 'pro'
    default:
      return 'free'
  }
}

export default class SubscriptionService implements ISubscriptionService {
  private purchases: IInAppPurchases
  private userService: IUserService
  private authService: IAuthService

  constructor(purchases: IInAppPurchases, userService: IUserService, authService: IAuthService) {
    this.purchases = purchases
    this.userService = userService
    this.authService = authService
  }

  async initialize(): Promise<void> {
    try {
      await this.purchases.initialize()
    } catch (error: any) {
      Log.error(TAG, `initialize error: ${error.message}`)
    }
  }

  async loginRevenueCat(userId: string): Promise<void> {
    try {
      await this.purchases.login(userId)
    } catch (error: any) {
      Log.error(TAG, `loginRevenueCat error: ${error.message}`)
    }
  }

  async logoutRevenueCat(): Promise<void> {
    try {
      await this.purchases.logout()
    } catch (error: any) {
      Log.error(TAG, `logoutRevenueCat error: ${error.message}`)
    }
  }

  async getCurrentTier(): Promise<SubscriptionTier> {
    try {
      const result = await this.purchases.getSubscription()
      return revenueCatTierToSubscription(result.subscription)
    } catch (error: any) {
      Log.error(TAG, `getCurrentTier error: ${error.message}`)
      return 'free'
    }
  }

  async syncSubscription(): Promise<void> {
    try {
      const userId = this.authService.currentUserId
      if (!userId) return

      const revenueCatTier = await this.getCurrentTier()
      const user = await this.userService.getUser(userId)
      if (!user) return

      if (user.subscriptionRevenuecat === revenueCatTier) return

      user.subscriptionRevenuecat = revenueCatTier
      user.subscription = effectiveSubscription(user)
      await this.userService.updateUser(user)
    } catch (error: any) {
      Log.error(TAG, `syncSubscription error: ${error.message}`)
    }
  }

  async purchase(productId: string): Promise<IResult> {
    try {
      const result = await this.purchases.purchaseProduct(productId)
      if (result.success) {
        await this.syncSubscription()
        return SuccessResult
      }
      if (result.canceled) return ErrorResult('Purchase canceled')
      return ErrorResult(result.error)
    } catch (error: any) {
      Log.error(TAG, `purchase error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async restorePurchases(): Promise<IResult> {
    try {
      const result = await this.purchases.restorePurchases()
      if (result.success) {
        await this.syncSubscription()
        return SuccessResult
      }
      return ErrorResult(result.error)
    } catch (error: any) {
      Log.error(TAG, `restorePurchases error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async getPrices(): Promise<{ tier1: string, tier2: string, tier3: string } | null> {
    try {
      const prices = await this.purchases.prices()
      if (!prices.success) return null
      return {
        tier1: prices.priceTier1,
        tier2: prices.priceTier2,
        tier3: prices.priceTier3,
      }
    } catch (error: any) {
      Log.error(TAG, `getPrices error: ${error.message}`)
      return null
    }
  }
}
