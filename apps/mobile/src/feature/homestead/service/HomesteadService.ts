import firestore from '@react-native-firebase/firestore'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_default } from '../../../schema/object/AdminObject'
import { homesteadMember_default } from '../../../schema/homestead/HomesteadMember'
import Homestead from '../../../schema/homestead/Homestead'
import HomesteadMember, { HomesteadRole } from '../../../schema/homestead/HomesteadMember'
import Log from '../../../library/log/Log'
import IHomesteadService from './IHomesteadService'
import { Col } from '@template/common'
import type { SubscriptionTier } from '../../subscription/service/ISubscriptionService'

const TAG = 'HomesteadService'

export default class HomesteadService implements IHomesteadService {

  private homesteadCollection() {
    return firestore().collection(Col.homestead)
  }

  async getHomestead(homesteadId: string): Promise<Homestead | null> {
    try {
      const doc = await this.homesteadCollection().doc(homesteadId).get()
      if (!doc.exists) return null
      return { ...doc.data(), id: doc.id } as Homestead
    } catch (error: any) {
      Log.error(TAG, `getHomestead error: ${error.message}`)
      return null
    }
  }

  async createHomestead(name: string, ownerUserId: string, ownerDisplayName: string, ownerEmail: string): Promise<string> {
    try {
      const homesteadRef = this.homesteadCollection().doc()
      const homestead: Homestead = {
        id: homesteadRef.id,
        admin: adminObject_default(),
        name,
        onboardingComplete: false,
        subscriptionRevenuecat: 'free',
        subscriptionOverride: 'free',
      }
      await homesteadRef.set(homestead)

      const memberRef = homesteadRef.collection(Col.member).doc(ownerUserId)
      const member: HomesteadMember = {
        ...homesteadMember_default(),
        id: ownerUserId,
        userId: ownerUserId,
        role: 'owner',
        displayName: ownerDisplayName,
        email: ownerEmail,
      }
      await memberRef.set(member as any)

      return homesteadRef.id
    } catch (error: any) {
      Log.error(TAG, `createHomestead error: ${error.message}`)
      return ''
    }
  }

  async getHomesteadsForUser(userId: string): Promise<Homestead[]> {
    try {
      const memberSnapshots = await firestore()
        .collectionGroup(Col.member)
        .where('userId', '==', userId)
        .where('admin.deleted', '==', false)
        .get()

      const homesteadIds = memberSnapshots.docs.map(doc => {
        const parentPath = doc.ref.parent.parent
        return parentPath?.id ?? ''
      }).filter(id => id !== '')

      if (homesteadIds.length === 0) return []

      const homesteads: Homestead[] = []
      for (const id of homesteadIds) {
        const homestead = await this.getHomestead(id)
        if (homestead && !homestead.admin.deleted) {
          homesteads.push(homestead)
        }
      }

      return homesteads
    } catch (error: any) {
      Log.error(TAG, `getHomesteadsForUser error: ${error.message}`)
      return []
    }
  }

  async getMembers(homesteadId: string): Promise<HomesteadMember[]> {
    try {
      const snapshot = await this.homesteadCollection()
        .doc(homesteadId)
        .collection(Col.member)
        .where('admin.deleted', '==', false)
        .get()

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as HomesteadMember))
    } catch (error: any) {
      Log.error(TAG, `getMembers error: ${error.message}`)
      return []
    }
  }

  async addMember(homesteadId: string, member: HomesteadMember): Promise<IResult> {
    try {
      const ref = this.homesteadCollection()
        .doc(homesteadId)
        .collection(Col.member)
        .doc()
      member.id = ref.id
      await ref.set(member as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `addMember error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  subscribeHomestead(homesteadId: string, callback: (homestead: Homestead | null) => void): () => void {
    return this.homesteadCollection()
      .doc(homesteadId)
      .onSnapshot(
        snapshot => {
          if (!snapshot.exists) {
            callback(null)
            return
          }
          callback({ ...snapshot.data(), id: snapshot.id } as Homestead)
        },
        error => {
          Log.error(TAG, `subscribeHomestead error: ${error.message}`)
          callback(null)
        }
      )
  }

  async getMemberRole(homesteadId: string, userId: string): Promise<HomesteadRole | null> {
    try {
      const doc = await this.homesteadCollection()
        .doc(homesteadId)
        .collection(Col.member)
        .doc(userId)
        .get()
      if (!doc.exists) return null
      return (doc.data() as HomesteadMember).role
    } catch (error: any) {
      Log.error(TAG, `getMemberRole error: ${error.message}`)
      return null
    }
  }

  async setOnboardingComplete(homesteadId: string): Promise<IResult> {
    try {
      await this.homesteadCollection().doc(homesteadId).update({ onboardingComplete: true })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `setOnboardingComplete error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateHomesteadSubscription(homesteadId: string, subscriptionRevenuecat: SubscriptionTier): Promise<IResult> {
    try {
      await this.homesteadCollection()
        .doc(homesteadId)
        .update({ subscriptionRevenuecat })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateHomesteadSubscription error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }
}
