import firestore from '@react-native-firebase/firestore'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import WeightLog from '../../../schema/weight/WeightLog'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import IWeightService from './IWeightService'

const TAG = 'WeightService'

export default class WeightService implements IWeightService {

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection('homestead').doc(homesteadId)
  }

  async getWeightLogsForAnimal(animalId: string): Promise<WeightLog[]> {
    try {
      const snapshot = await this.homesteadRef
        .collection('weightLog')
        .where('animalId', '==', animalId)
        .where('admin.deleted', '==', false)
        .get()

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as WeightLog))
    } catch (error: any) {
      Log.error(TAG, `getWeightLogsForAnimal error: ${error.message}`)
      return []
    }
  }

  async createWeightLog(log: WeightLog): Promise<IResult> {
    try {
      const ref = this.homesteadRef.collection('weightLog').doc()
      log.id = ref.id
      await ref.set(log as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createWeightLog error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateWeightLog(log: WeightLog): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(log.admin)
      await this.homesteadRef.collection('weightLog').doc(log.id).update(log as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateWeightLog error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteWeightLog(id: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection('weightLog').doc(id).update({
        'admin.deleted': true,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `deleteWeightLog error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }
}
