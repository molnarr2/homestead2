import firestore from '@react-native-firebase/firestore'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import BreedingRecord from '../../../schema/breeding/BreedingRecord'
import Animal from '../../../schema/animal/Animal'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import IBreedingService from './IBreedingService'

const TAG = 'BreedingService'

export default class BreedingService implements IBreedingService {

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection('homestead').doc(homesteadId)
  }

  subscribeActiveBreedings(callback: (records: BreedingRecord[]) => void): () => void {
    return this.homesteadRef
      .collection('breedingRecord')
      .where('admin.deleted', '==', false)
      .where('status', '==', 'active')
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
        .collection('breedingRecord')
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
      const ref = this.homesteadRef.collection('breedingRecord').doc()
      record.id = ref.id
      await ref.set(record as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createBreedingRecord error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateBreedingRecord(record: BreedingRecord): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(record.admin)
      await this.homesteadRef.collection('breedingRecord').doc(record.id).update(record as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateBreedingRecord error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async recordBirthOutcome(record: BreedingRecord, offspring: Animal[]): Promise<IResult> {
    try {
      const batch = firestore().batch()

      const recordRef = this.homesteadRef.collection('breedingRecord').doc(record.id)
      batch.update(recordRef, record as any)

      for (const animal of offspring) {
        const animalRef = this.homesteadRef.collection('animal').doc()
        animal.id = animalRef.id
        batch.set(animalRef, animal as any)
      }

      await batch.commit()
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `recordBirthOutcome error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteBreedingRecord(id: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection('breedingRecord').doc(id).update({
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
