import { IResult } from '../../../util/Result'
import Homestead from '../../../schema/homestead/Homestead'

export type SubscriptionTier = 'free' | 'pro' | 'farm'

export function effectiveSubscription(homestead: Homestead | null): SubscriptionTier {
  if (!homestead) return 'free'
  const tierRank: Record<SubscriptionTier, number> = { free: 0, pro: 1, farm: 2 }
  const fromOverride = tierRank[homestead.subscriptionOverride] ?? 0
  const fromRevenueCat = tierRank[homestead.subscriptionRevenuecat] ?? 0
  const tiers: SubscriptionTier[] = ['free', 'pro', 'farm']
  return tiers[Math.max(fromOverride, fromRevenueCat)]
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
