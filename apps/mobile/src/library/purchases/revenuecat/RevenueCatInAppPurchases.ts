import { Platform } from "react-native"
import IInAppPurchases, {
    CanceledPurchase,
    IPurchaseResult,
    SuccessPurchase,
    errorPurchase,
    SubscriptionWithError
} from "../../../core/plugin/IInAppPurchases"
import { InAppPrices, InAppSubscription } from "../../../core/service/purchases/IInAppPurchaseService"

const getPurchases = () => require("react-native-purchases").default as typeof import("react-native-purchases").default

// TODO: set the RevenueCat API keys for each platform before using this class.
const APPLE_API_KEY = ""
const GOOGLE_API_KEY = ""

export default class RevenueCatInAppPurchases implements IInAppPurchases {

    productTier1 = "tier1"
    productTier2 = "tier2"
    productTier3 = "tier3"

    identifierTier1 = "tier1"
    identifierTier2 = "tier2"
    identifierTier3 = "tier3"

    entitlementTier1 = "tier1"
    entitlementTier2 = "tier2"
    entitlementTier3 = "tier3"

    constructor() {
        if (Platform.OS === 'android') {
            this.productTier1 = "tier1"
            this.productTier2 = "tier2"
            this.productTier3 = "tier3"

            this.identifierTier1 = "tier1:tier1"
            this.identifierTier2 = "tier2:tier2"
            this.identifierTier3 = "tier3:tier3"

            this.entitlementTier1 = "tier1"
            this.entitlementTier2 = "tier2"
            this.entitlementTier3 = "tier3"
        }
    }

    async initialize(): Promise<void> {
        const Purchases = getPurchases()
        await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG)

        if (Platform.OS === 'ios') {
            Purchases.configure({ apiKey: APPLE_API_KEY })
        } else if (Platform.OS === 'android') {
            Purchases.configure({ apiKey: GOOGLE_API_KEY })
        }
    }

    async login(userId: string): Promise<void> {
        await getPurchases().logIn(userId)
    }

    async logout(): Promise<void> {
        await getPurchases().logOut()
    }

    async getProducts(): Promise<void> {
        await getPurchases().getProducts([this.productTier1, this.productTier2, this.productTier3])
    }

    async purchaseProduct(productId: string): Promise<IPurchaseResult> {
        let entitlementId = this.entitlementTier1
        if (productId === this.productTier2) {
            entitlementId = this.entitlementTier2
        } else if (productId === this.productTier3) {
            entitlementId = this.entitlementTier3
        }
        return this.performPurchase(productId, entitlementId)
    }

    async prices(): Promise<InAppPrices> {
        const products = await getPurchases().getProducts([this.productTier1, this.productTier2, this.productTier3])

        const price1 = products.find((item) => item.identifier === this.identifierTier1)?.priceString
        const price2 = products.find((item) => item.identifier === this.identifierTier2)?.priceString
        const price3 = products.find((item) => item.identifier === this.identifierTier3)?.priceString

        if (price1 === undefined || price2 === undefined || price3 === undefined) {
            return {
                success: false,
                priceTier1: "",
                priceTier2: "",
                priceTier3: "",
            }
        }

        return {
            success: true,
            priceTier1: price1,
            priceTier2: price2,
            priceTier3: price3,
        }
    }

    async restorePurchases(): Promise<IPurchaseResult> {
        try {
            await getPurchases().restorePurchases()
            return SuccessPurchase
        } catch (e) {
            return errorPurchase("" + e)
        }
    }

    async performPurchase(productId: string, entitlementId: string): Promise<IPurchaseResult> {
        try {
            const Purchases = getPurchases()
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
            const customerInfo = await getPurchases().getCustomerInfo()
            const hasTier1 = typeof customerInfo.entitlements.active[this.entitlementTier1] !== "undefined"
            const hasTier2 = typeof customerInfo.entitlements.active[this.entitlementTier2] !== "undefined"
            const hasTier3 = typeof customerInfo.entitlements.active[this.entitlementTier3] !== "undefined"

            if (hasTier3) {
                return toSubscriptionResult(InAppSubscription.tier3)
            } else if (hasTier2) {
                return toSubscriptionResult(InAppSubscription.tier2)
            } else if (hasTier1) {
                return toSubscriptionResult(InAppSubscription.tier1)
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
