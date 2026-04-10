import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { InAppSubscription } from '../../../core/service/purchases/IInAppPurchaseService'
import IInAppPurchases from '../../../core/plugin/IInAppPurchases'
import Log from '../../../library/log/Log'
import ISubscriptionService from './ISubscriptionService'

const TAG = 'SubscriptionService'

export default class SubscriptionService implements ISubscriptionService {
  private purchases: IInAppPurchases

  constructor(purchases: IInAppPurchases) {
    this.purchases = purchases
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

  async getCurrentTier(): Promise<'free' | 'pro' | 'farm'> {
    try {
      const result = await this.purchases.getSubscription()
      switch (result.subscription) {
        case InAppSubscription.tier3:
          return 'farm'
        case InAppSubscription.tier2:
          return 'pro'
        case InAppSubscription.tier1:
          return 'pro'
        default:
          return 'free'
      }
    } catch (error: any) {
      Log.error(TAG, `getCurrentTier error: ${error.message}`)
      return 'free'
    }
  }

  async purchase(productId: string): Promise<IResult> {
    try {
      const result = await this.purchases.purchaseProduct(productId)
      if (result.success) return SuccessResult
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
      if (result.success) return SuccessResult
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
