import { InAppPrices, InAppSubscription } from '../service/purchases/IInAppPurchaseService'

export interface IPurchaseResult {
  success: boolean
  canceled: boolean
  error: string
}

export const SuccessPurchase: IPurchaseResult = {
  success: true,
  canceled: false,
  error: '',
}

export const CanceledPurchase: IPurchaseResult = {
  success: false,
  canceled: true,
  error: '',
}

export function errorPurchase(error: string): IPurchaseResult {
  return {
    success: false,
    canceled: false,
    error,
  }
}

export interface SubscriptionWithError {
  subscription: InAppSubscription
  errorMessage: string
}

export default interface IInAppPurchases {
  initialize(): Promise<void>
  login(userId: string): Promise<void>
  logout(): Promise<void>
  getProducts(): Promise<void>
  purchaseProduct(productId: string): Promise<IPurchaseResult>
  prices(): Promise<InAppPrices>
  restorePurchases(): Promise<IPurchaseResult>
  getSubscription(): Promise<SubscriptionWithError>
}
