import { Platform, NativeModules } from "react-native"
import Config from "react-native-config"
import IInAppPurchases, {
    CanceledPurchase,
    IPurchaseResult,
    SuccessPurchase,
    errorPurchase,
    SubscriptionWithError
} from "../../../core/plugin/IInAppPurchases"
import { InAppPrices, InAppSubscription } from "../../../core/service/purchases/IInAppPurchaseService"

const getPurchases = (): typeof import("react-native-purchases").default | null => {
    if (!NativeModules.RNPurchases) return null
    try {
        return require("react-native-purchases").default
    } catch {
        return null
    }
}

const APPLE_API_KEY = Config.PUBLIC_APPLE_API_KEY ?? ""
const GOOGLE_API_KEY = Config.PUBLIC_GOOGLE_API_KEY ?? ""

export default class RevenueCatInAppPurchases implements IInAppPurchases {

    productStandard = "homestead_standard_monthly"
    productPro = "homestead_pro_monthly"

    identifierStandard = "homestead_standard_monthly"
    identifierPro = "homestead_pro_monthly"

    entitlementStandard = "standard_v2"
    entitlementPro = "pro_v2"

    private initialized = false

    constructor() {
        if (Platform.OS === 'android') {
            this.identifierStandard = "homestead_standard_monthly:homestead-standard-monthly"
            this.identifierPro = "homestead_pro_monthly:homestead-pro-monthly"
        }
    }

    async initialize(): Promise<void> {
        if (this.initialized) return
        const Purchases = getPurchases()
        if (!Purchases) return
        await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG)

        if (Platform.OS === 'ios') {
            Purchases.configure({ apiKey: APPLE_API_KEY })
        } else if (Platform.OS === 'android') {
            Purchases.configure({ apiKey: GOOGLE_API_KEY })
        }
        this.initialized = true
    }

    async login(userId: string): Promise<void> {
        const Purchases = getPurchases()
        if (!Purchases) return
        await Purchases.logIn(userId)
    }

    async logout(): Promise<void> {
        const Purchases = getPurchases()
        if (!Purchases) return
        await Purchases.logOut()
    }

    async getProducts(): Promise<void> {
        const Purchases = getPurchases()
        if (!Purchases) return
        await Purchases.getProducts([this.productStandard, this.productPro])
    }

    async purchaseProduct(productId: string): Promise<IPurchaseResult> {
        const entitlementId = productId === this.productPro
            ? this.entitlementPro
            : this.entitlementStandard
        return this.performPurchase(productId, entitlementId)
    }

    async prices(): Promise<InAppPrices> {
        const Purchases = getPurchases()
        if (!Purchases) return { success: false, priceStandard: "", pricePro: "" }
        const products = await Purchases.getProducts([this.productStandard, this.productPro])

        const priceStandard = products.find((item) => item.identifier === this.identifierStandard)?.priceString
        const pricePro = products.find((item) => item.identifier === this.identifierPro)?.priceString

        if (priceStandard === undefined || pricePro === undefined) {
            return { success: false, priceStandard: "", pricePro: "" }
        }

        return { success: true, priceStandard, pricePro }
    }

    async restorePurchases(): Promise<IPurchaseResult> {
        try {
            const Purchases = getPurchases()
            if (!Purchases) return errorPurchase("RevenueCat not available")
            await Purchases.restorePurchases()
            return SuccessPurchase
        } catch (e) {
            return errorPurchase("" + e)
        }
    }

    async performPurchase(productId: string, entitlementId: string): Promise<IPurchaseResult> {
        try {
            const Purchases = getPurchases()
            if (!Purchases) return errorPurchase("RevenueCat not available")
            const product = await Purchases.getProducts([productId])
            const { customerInfo } = await Purchases.purchaseStoreProduct(product[0])
            if (typeof customerInfo.entitlements.active[entitlementId] !== "undefined") {
                return SuccessPurchase
            }

            return errorPurchase("Purchase did not go through.")
        } catch (e) {
            const error = e as any
            if (error.userCancelled) {
                return CanceledPurchase
            }

            console.log("ERROR: " + error.toString())
            return errorPurchase(error.toString())
        }
    }

    async getSubscription(): Promise<SubscriptionWithError> {
        try {
            const Purchases = getPurchases()
            if (!Purchases) return toSubscriptionResult(InAppSubscription.error, "RevenueCat not available")
            const customerInfo = await Purchases.getCustomerInfo()
            const hasPro = typeof customerInfo.entitlements.active[this.entitlementPro] !== "undefined"
            const hasStandard = typeof customerInfo.entitlements.active[this.entitlementStandard] !== "undefined"

            if (hasPro) {
                return toSubscriptionResult(InAppSubscription.pro)
            } else if (hasStandard) {
                return toSubscriptionResult(InAppSubscription.standard)
            }

            return toSubscriptionResult(InAppSubscription.free)
        } catch (e) {
            return toSubscriptionResult(InAppSubscription.error, "" + e)
        }
    }
}

function toSubscriptionResult(subscription: InAppSubscription, errorMessage: string = ""): SubscriptionWithError {
    return {
        subscription: subscription,
        errorMessage: errorMessage,
    }
}
