import { IResult } from '../../../util/Result'
import User from '../../../schema/user/User'

export type SubscriptionTier = 'free' | 'pro' | 'farm'

export function effectiveSubscription(user: User): SubscriptionTier {
  const tierRank: Record<SubscriptionTier, number> = { free: 0, pro: 1, farm: 2 }
  const fromRevenueCat = tierRank[user.subscriptionRevenuecat] ?? 0
  const fromOverride = tierRank[user.subscriptionOverride] ?? 0
  const tiers: SubscriptionTier[] = ['free', 'pro', 'farm']
  return tiers[Math.max(fromRevenueCat, fromOverride)]
}

export default interface ISubscriptionService {
  initialize(): Promise<void>
  loginRevenueCat(userId: string): Promise<void>
  logoutRevenueCat(): Promise<void>
  getCurrentTier(): Promise<SubscriptionTier>
  syncSubscription(): Promise<void>
  purchase(productId: string): Promise<IResult>
  restorePurchases(): Promise<IResult>
  getPrices(): Promise<{ tier1: string, tier2: string, tier3: string } | null>
}
