import firestore from '@react-native-firebase/firestore'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import WeightLog from '../../../schema/weight/WeightLog'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import IWeightService from './IWeightService'
import { Col } from '@template/common'

const TAG = 'WeightService'

export default class WeightService implements IWeightService {

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection(Col.homestead).doc(homesteadId)
  }

  subscribeWeightLogs(callback: (logs: WeightLog[]) => void): () => void {
    return this.homesteadRef
      .collection(Col.weightLog)
      .where('admin.deleted', '==', false)
      .onSnapshot(
        snapshot => {
          const logs: WeightLog[] = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          } as WeightLog))
          callback(logs)
        },
        error => {
          Log.error(TAG, `subscribeWeightLogs error: ${error.message}`)
          callback([])
        }
      )
  }

  async createWeightLog(log: WeightLog): Promise<IResult> {
    try {
      const ref = this.homesteadRef.collection(Col.weightLog).doc()
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
      await this.homesteadRef.collection(Col.weightLog).doc(log.id).update(log as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateWeightLog error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteWeightLog(id: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection(Col.weightLog).doc(id).update({
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
