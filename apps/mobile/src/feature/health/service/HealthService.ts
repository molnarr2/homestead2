import firestore from '@react-native-firebase/firestore'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import HealthRecord from '../../../schema/health/HealthRecord'
import { calculateWithdrawal } from '../../../util/WithdrawalUtility'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import ICareService from '../../care/service/ICareService'
import IHealthService from './IHealthService'

const TAG = 'HealthService'

export default class HealthService implements IHealthService {
  private careService: ICareService

  constructor(careService: ICareService) {
    this.careService = careService
  }

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection('homestead').doc(homesteadId)
  }

  async getHealthRecordsForAnimal(animalId: string): Promise<HealthRecord[]> {
    try {
      const snapshot = await this.homesteadRef
        .collection('healthRecord')
        .where('animalId', '==', animalId)
        .where('admin.deleted', '==', false)
        .get()

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as HealthRecord))
    } catch (error: any) {
      Log.error(TAG, `getHealthRecordsForAnimal error: ${error.message}`)
      return []
    }
  }

  async getActiveWithdrawalRecords(): Promise<HealthRecord[]> {
    try {
      const snapshot = await this.homesteadRef
        .collection('healthRecord')
        .where('admin.deleted', '==', false)
        .get()

      const allRecords = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as HealthRecord))

      return this.filterActiveWithdrawals(allRecords)
    } catch (error: any) {
      Log.error(TAG, `getActiveWithdrawalRecords error: ${error.message}`)
      return []
    }
  }

  subscribeActiveWithdrawals(callback: (records: HealthRecord[]) => void): () => void {
    return this.homesteadRef
      .collection('healthRecord')
      .where('admin.deleted', '==', false)
      .onSnapshot(
        snapshot => {
          const allRecords: HealthRecord[] = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          } as HealthRecord))
          const activeWithdrawals = this.filterActiveWithdrawals(allRecords)
          callback(activeWithdrawals)
        },
        error => {
          Log.error(TAG, `onSnapshot error: ${error.message}`)
          callback([])
        }
      )
  }

  async createHealthRecord(record: HealthRecord): Promise<IResult> {
    try {
      const ref = this.homesteadRef.collection('healthRecord').doc()
      record.id = ref.id
      await ref.set(record as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createHealthRecord error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateHealthRecord(record: HealthRecord): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(record.admin)
      await this.homesteadRef.collection('healthRecord').doc(record.id).update(record as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateHealthRecord error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  private filterActiveWithdrawals(records: HealthRecord[]): HealthRecord[] {
    return records.filter(record => {
      if (record.withdrawalPeriodDays > 0) {
        const result = calculateWithdrawal(record.date, record.withdrawalPeriodDays, record.withdrawalType, record.name)
        if (result.status === 'ACTIVE') return true
      }
      if (record.dewormingWithdrawalDays > 0) {
        const result = calculateWithdrawal(record.date, record.dewormingWithdrawalDays, record.dewormingWithdrawalType, record.name)
        if (result.status === 'ACTIVE') return true
      }
      return false
    })
  }

  async deleteHealthRecord(id: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection('healthRecord').doc(id).update({
        'admin.deleted': true,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `deleteHealthRecord error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }
}
