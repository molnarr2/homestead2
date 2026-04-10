import { IResult } from '../../../util/Result'

export default interface ISubscriptionService {
  initialize(): Promise<void>
  loginRevenueCat(userId: string): Promise<void>
  logoutRevenueCat(): Promise<void>
  getCurrentTier(): Promise<'free' | 'pro' | 'farm'>
  purchase(productId: string): Promise<IResult>
  restorePurchases(): Promise<IResult>
  getPrices(): Promise<{ tier1: string, tier2: string, tier3: string } | null>
}
