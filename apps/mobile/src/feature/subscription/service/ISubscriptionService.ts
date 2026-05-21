import { IResult } from '../../../util/Result'
import Homestead from '../../../schema/homestead/Homestead'

export type SubscriptionTier = 'free' | 'standard' | 'pro'

const tierRank: Record<string, number> = { free: 0, standard: 1, pro: 2, farm: 2 }
const tiers: SubscriptionTier[] = ['free', 'standard', 'pro']

export function effectiveSubscription(homestead: Homestead | null): SubscriptionTier {
  if (!homestead) return 'free'
  const fromOverride = tierRank[homestead.subscriptionOverride] ?? 0
  const fromRevenueCat = tierRank[homestead.subscriptionRevenuecat] ?? 0
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
  getPrices(): Promise<{ standard: string, pro: string } | null>
}
