import AdminObject, { adminObject_default } from '../object/AdminObject'
import type { SubscriptionTier } from '../../feature/subscription/service/ISubscriptionService'

export default interface Homestead {
  id: string
  admin: AdminObject
  name: string
  onboardingComplete: boolean
  subscriptionRevenuecat: SubscriptionTier
  subscriptionOverride: SubscriptionTier
}

export function homestead_default(): Homestead {
  return {
    id: '',
    admin: adminObject_default(),
    name: '',
    onboardingComplete: false,
    subscriptionRevenuecat: 'free',
    subscriptionOverride: 'free',
  }
}
