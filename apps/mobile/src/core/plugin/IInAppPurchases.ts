import { InAppPrices, InAppSubscription } from "../service/purchases/IInAppPurchaseService"

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

export interface SubscriptionWithError {
    subscription: InAppSubscription
    errorMessage: string
}

export interface IPurchaseResult {
    success: boolean
    userCanceled: boolean
    errorMessage: string
}

export const SuccessPurchase: IPurchaseResult = {
    success: true,
    userCanceled: false,
    errorMessage: ""
}

export const CanceledPurchase: IPurchaseResult = {
    success: false,
    userCanceled: true,
    errorMessage: ""
}

export function errorPurchase(error: string): IPurchaseResult {
    return {
        success: false,
        userCanceled: false,
        errorMessage: error
    }
}
