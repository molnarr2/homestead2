import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import Animal from '../../../schema/animal/Animal'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import IAnimalService from './IAnimalService'

const TAG = 'AnimalService'

export default class AnimalService implements IAnimalService {

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection('homestead').doc(homesteadId)
  }

  subscribeAnimals(callback: (animals: Animal[]) => void): () => void {
    return this.homesteadRef
      .collection('animal')
      .where('admin.deleted', '==', false)
      .onSnapshot(
        snapshot => {
          const animals: Animal[] = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          } as Animal))
          callback(animals)
        },
        error => {
          Log.error(TAG, `onSnapshot error: ${error.message}`)
          callback([])
        }
      )
  }

  async getAnimal(id: string): Promise<Animal | null> {
    try {
      const doc = await this.homesteadRef.collection('animal').doc(id).get()
      if (!doc.exists) return null
      return { ...doc.data(), id: doc.id } as Animal
    } catch (error: any) {
      Log.error(TAG, `getAnimal error: ${error.message}`)
      return null
    }
  }

  async createAnimal(animal: Animal): Promise<IResult> {
    try {
      const ref = this.homesteadRef.collection('animal').doc()
      animal.id = ref.id
      await ref.set(animal as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createAnimal error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateAnimal(animal: Animal): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(animal.admin)
      await this.homesteadRef.collection('animal').doc(animal.id).update(animal as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateAnimal error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteAnimal(id: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection('animal').doc(id).update({
        'admin.deleted': true,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `deleteAnimal error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateAnimalState(animalId: string, state: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection('animal').doc(animalId).update({
        state,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateAnimalState error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async uploadAnimalPhoto(animalId: string, uri: string): Promise<{ url: string, ref: string } | null> {
    try {
      const homesteadId = useHomesteadStore.getState().homesteadId
      const path = `homestead/${homesteadId}/animal/${animalId}/${Date.now()}.jpg`
      const ref = storage().ref(path)
      await ref.putFile(uri)
      const url = await ref.getDownloadURL()
      return { url, ref: path }
    } catch (error: any) {
      Log.error(TAG, `uploadAnimalPhoto error: ${error.message}`)
      return null
    }
  }
}
