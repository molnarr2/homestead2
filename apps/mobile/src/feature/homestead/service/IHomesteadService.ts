import { IResult } from '../../../util/Result'
import Homestead from '../../../schema/homestead/Homestead'
import HomesteadMember, { HomesteadRole } from '../../../schema/homestead/HomesteadMember'
import type { SubscriptionTier } from '../../subscription/service/ISubscriptionService'

export default interface IHomesteadService {
  getHomestead(homesteadId: string): Promise<Homestead | null>
  subscribeHomestead(homesteadId: string, callback: (homestead: Homestead | null) => void): () => void
  createHomestead(name: string, ownerUserId: string, ownerDisplayName: string, ownerEmail: string): Promise<string>
  getHomesteadsForUser(userId: string): Promise<Homestead[]>
  getMembers(homesteadId: string): Promise<HomesteadMember[]>
  getMemberRole(homesteadId: string, userId: string): Promise<HomesteadRole | null>
  addMember(homesteadId: string, member: HomesteadMember): Promise<IResult>
  setOnboardingComplete(homesteadId: string): Promise<IResult>
  updateHomesteadSubscription(homesteadId: string, subscriptionRevenuecat: SubscriptionTier): Promise<IResult>
}
