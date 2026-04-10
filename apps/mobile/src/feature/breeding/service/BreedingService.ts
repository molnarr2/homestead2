import firestore from '@react-native-firebase/firestore'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_default } from '../../../schema/object/AdminObject'
import BreedingRecord, { BirthOutcome } from '../../../schema/breeding/BreedingRecord'
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

  subscribe(callback: (records: BreedingRecord[]) => void): () => void {
    return this.homesteadRef
      .collection('breedingRecord')
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

  async completeBirth(recordId: string, outcome: BirthOutcome, dam: Animal): Promise<IResult> {
    try {
      const batch = firestore().batch()
      const offspringIds: string[] = []

      for (let i = 0; i < outcome.bornAlive; i++) {
        const offspringRef = this.homesteadRef.collection('animal').doc()
        offspringIds.push(offspringRef.id)
        batch.set(offspringRef, {
          id: offspringRef.id,
          name: `Baby ${i + 1}`,
          animalType: dam.animalType,
          animalTypeId: dam.animalTypeId,
          animalTypeLevel: dam.animalTypeLevel,
          breed: dam.breed,
          animalBreedId: dam.animalBreedId,
          birthday: outcome.birthDate,
          gender: 'unknown',
          color: '',
          register: '',
          state: 'own',
          notes: '',
          photoStorageRef: '',
          photoUrl: '',
          purchasePrice: 0,
          weight: 0,
          weightUnit: 'lbs',
          sireId: outcome.sireId ?? '',
          damId: dam.id,
          admin: adminObject_default(),
        })
      }

      const recordRef = this.homesteadRef.collection('breedingRecord').doc(recordId)
      batch.update(recordRef, {
        status: 'completed',
        birthDate: outcome.birthDate,
        bornAlive: outcome.bornAlive,
        stillborn: outcome.stillborn,
        complications: outcome.complications,
        damCondition: outcome.damCondition,
        offspringIds,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })

      await batch.commit()
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `completeBirth error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async failBreeding(recordId: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection('breedingRecord').doc(recordId).update({
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
