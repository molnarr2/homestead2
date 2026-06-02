import firestore from '@react-native-firebase/firestore'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import BreedingRecord, { BirthOutcome } from '../../../schema/breeding/BreedingRecord'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import IBreedingService from './IBreedingService'
import IAnalyticsService from '../../../core/service/analytics/IAnalyticsService'
import AnalyticsEvent from '../../../core/service/analytics/AnalyticsEvent'
import { Col } from '@template/common'

const TAG = 'BreedingService'

export default class BreedingService implements IBreedingService {
  private analyticsService: IAnalyticsService

  constructor(analyticsService: IAnalyticsService) {
    this.analyticsService = analyticsService
  }

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection(Col.homestead).doc(homesteadId)
  }

  subscribe(callback: (records: BreedingRecord[]) => void): () => void {
    return this.homesteadRef
      .collection(Col.breedingRecord)
      .where('admin.deleted', '==', false)
      .onSnapshot(
        snapshot => {
          const records: BreedingRecord[] = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          } as BreedingRecord))
          callback(records)
        },
        error => {
          Log.error(TAG, `onSnapshot error: ${error.message}`)
          callback([])
        }
      )
  }

  async getBreedingRecordsForAnimal(animalId: string): Promise<BreedingRecord[]> {
    try {
      const snapshot = await this.homesteadRef
        .collection(Col.breedingRecord)
        .where('animalId', '==', animalId)
        .where('admin.deleted', '==', false)
        .get()

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as BreedingRecord))
    } catch (error: any) {
      Log.error(TAG, `getBreedingRecordsForAnimal error: ${error.message}`)
      return []
    }
  }

  async createBreedingRecord(record: BreedingRecord): Promise<IResult> {
    try {
      const ref = this.homesteadRef.collection(Col.breedingRecord).doc()
      record.id = ref.id
      await ref.set(record as any)
      this.analyticsService.logAction(AnalyticsEvent.add_breeding_record)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createBreedingRecord error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateBreedingRecord(record: BreedingRecord): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(record.admin)
      await this.homesteadRef.collection(Col.breedingRecord).doc(record.id).update(record as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateBreedingRecord error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async completeBirth(recordId: string, outcome: BirthOutcome): Promise<IResult> {
    try {
      await this.homesteadRef.collection(Col.breedingRecord).doc(recordId).update({
        status: 'completed',
        birthDate: outcome.birthDate,
        bornAlive: outcome.bornAlive,
        stillborn: outcome.stillborn,
        complications: outcome.complications,
        damCondition: outcome.damCondition,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `completeBirth error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async failBreeding(recordId: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection(Col.breedingRecord).doc(recordId).update({
        status: 'failed',
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `failBreeding error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteBreedingRecord(id: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection(Col.breedingRecord).doc(id).update({
        'admin.deleted': true,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `deleteBreedingRecord error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }
}
