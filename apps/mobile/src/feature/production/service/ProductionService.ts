import firestore from '@react-native-firebase/firestore'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import ProductionLog from '../../../schema/production/ProductionLog'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import IProductionService from './IProductionService'
import { Col } from '@template/common'

const TAG = 'ProductionService'

export default class ProductionService implements IProductionService {

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection(Col.homestead).doc(homesteadId)
  }

  subscribeProductionLogs(callback: (logs: ProductionLog[]) => void): () => void {
    return this.homesteadRef
      .collection(Col.productionLog)
      .where('admin.deleted', '==', false)
      .onSnapshot(
        snapshot => {
          const logs: ProductionLog[] = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          } as ProductionLog))
          callback(logs)
        },
        error => {
          Log.error(TAG, `subscribeProductionLogs error: ${error.message}`)
          callback([])
        }
      )
  }

  async createProductionLog(log: ProductionLog): Promise<IResult> {
    try {
      const ref = this.homesteadRef.collection(Col.productionLog).doc()
      log.id = ref.id
      await ref.set(log as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createProductionLog error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateProductionLog(log: ProductionLog): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(log.admin)
      await this.homesteadRef.collection(Col.productionLog).doc(log.id).update(log as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateProductionLog error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteProductionLog(id: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection(Col.productionLog).doc(id).update({
        'admin.deleted': true,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `deleteProductionLog error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }
}
