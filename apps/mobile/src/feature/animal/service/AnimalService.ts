import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage'
import auth from '@react-native-firebase/auth'
import { Platform } from 'react-native'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import Animal from '../../../schema/animal/Animal'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import IAnimalService from './IAnimalService'
import { Col } from '@template/common'

const TAG = 'AnimalService'

export default class AnimalService implements IAnimalService {

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection(Col.homestead).doc(homesteadId)
  }

  subscribeAnimals(callback: (animals: Animal[]) => void): () => void {
    return this.homesteadRef
      .collection(Col.animal)
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
      const doc = await this.homesteadRef.collection(Col.animal).doc(id).get()
      if (!doc.exists) return null
      return { ...doc.data(), id: doc.id } as Animal
    } catch (error: any) {
      Log.error(TAG, `getAnimal error: ${error.message}`)
      return null
    }
  }

  async createAnimal(animal: Animal): Promise<IResult> {
    try {
      const ref = this.homesteadRef.collection(Col.animal).doc()
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
      await this.homesteadRef.collection(Col.animal).doc(animal.id).update(animal as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateAnimal error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteAnimal(id: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection(Col.animal).doc(id).update({
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
      await this.homesteadRef.collection(Col.animal).doc(animalId).update({
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

      // Auth state
      const user = auth().currentUser
      Log.debug(TAG, `uploadAnimalPhoto auth uid: ${user?.uid ?? 'NULL — not signed in!'}`)

      // File check — use fetch HEAD to verify the file exists and get its size
      try {
        const fileResponse = await fetch(uri)
        const blob = await fileResponse.blob()
        Log.debug(TAG, `uploadAnimalPhoto file exists — size: ${blob.size} bytes, type: ${blob.type}`)
      } catch (fileError: any) {
        Log.error(TAG, `uploadAnimalPhoto FILE NOT READABLE at uri: ${uri} — ${fileError.message}`)
      }

      Log.debug(TAG, `uploadAnimalPhoto uri: ${uri}`)
      Log.debug(TAG, `uploadAnimalPhoto platform: ${Platform.OS}`)
      Log.debug(TAG, `uploadAnimalPhoto storagePath: ${path}`)
      Log.debug(TAG, `uploadAnimalPhoto bucket: ${storage().app.options.storageBucket}`)

      const ref = storage().ref(path)

      // Attempt 1: putFile with original URI
      Log.debug(TAG, `uploadAnimalPhoto calling putFile with original uri...`)
      try {
        await ref.putFile(uri)
      } catch (putError: any) {
        Log.error(TAG, `uploadAnimalPhoto putFile failed with original uri — code: ${putError.code}, message: ${putError.message}`)
        Log.error(TAG, `uploadAnimalPhoto putFile nativeErrorMessage: ${putError.nativeErrorMessage ?? 'none'}`)
        Log.error(TAG, `uploadAnimalPhoto putFile userInfo: ${JSON.stringify(putError.userInfo ?? {})}`)

        // Attempt 2: strip file:// prefix on iOS
        if (Platform.OS === 'ios' && uri.startsWith('file://')) {
          const strippedUri = uri.replace('file://', '')
          Log.debug(TAG, `uploadAnimalPhoto retrying putFile with stripped uri: ${strippedUri}`)
          await ref.putFile(strippedUri)
        } else {
          throw putError
        }
      }

      Log.debug(TAG, `uploadAnimalPhoto putFile succeeded, getting download URL...`)
      const url = await ref.getDownloadURL()
      Log.debug(TAG, `uploadAnimalPhoto complete — url: ${url}`)
      return { url, ref: path }
    } catch (error: any) {
      Log.error(TAG, `uploadAnimalPhoto FINAL error: ${error.message}`)
      Log.error(TAG, `uploadAnimalPhoto FINAL error code: ${error.code}`)
      Log.error(TAG, `uploadAnimalPhoto FINAL nativeErrorMessage: ${error.nativeErrorMessage ?? 'none'}`)
      Log.error(TAG, `uploadAnimalPhoto FINAL userInfo: ${JSON.stringify(error.userInfo ?? {})}`)
      Log.error(TAG, `uploadAnimalPhoto FINAL uri was: ${uri}`)
      return null
    }
  }
}
