import firestore from '@react-native-firebase/firestore'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import ProductionLog from '../../../schema/production/ProductionLog'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import IProductionService from './IProductionService'

const TAG = 'ProductionService'

export default class ProductionService implements IProductionService {

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection('homestead').doc(homesteadId)
  }

  async getProductionLogs(): Promise<ProductionLog[]> {
    try {
      const snapshot = await this.homesteadRef
        .collection('productionLog')
        .where('admin.deleted', '==', false)
        .get()

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as ProductionLog))
    } catch (error: any) {
      Log.error(TAG, `getProductionLogs error: ${error.message}`)
      return []
    }
  }

  async getProductionLogsForAnimal(animalId: string): Promise<ProductionLog[]> {
    try {
      const snapshot = await this.homesteadRef
        .collection('productionLog')
        .where('animalId', '==', animalId)
        .where('admin.deleted', '==', false)
        .get()

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as ProductionLog))
    } catch (error: any) {
      Log.error(TAG, `getProductionLogsForAnimal error: ${error.message}`)
      return []
    }
  }

  async createProductionLog(log: ProductionLog): Promise<IResult> {
    try {
      const ref = this.homesteadRef.collection('productionLog').doc()
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
      await this.homesteadRef.collection('productionLog').doc(log.id).update(log as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateProductionLog error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteProductionLog(id: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection('productionLog').doc(id).update({
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
