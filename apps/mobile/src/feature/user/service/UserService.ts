import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import User from '../../../schema/user/User'
import Log from '../../../library/log/Log'
import IUserService from './IUserService'
import { Col } from '@template/common'

const TAG = 'UserService'

export default class UserService implements IUserService {

  private userCollection() {
    return firestore().collection(Col.user)
  }

  subscribeUser(userId: string, callback: (user: User | null) => void): () => void {
    return this.userCollection()
      .doc(userId)
      .onSnapshot(
        snapshot => {
          if (!snapshot.exists) {
            callback(null)
            return
          }
          const user = { ...snapshot.data(), id: snapshot.id } as User
          callback(user)
        },
        error => {
          Log.error(TAG, `subscribeUser error: ${error.message}`)
          callback(null)
        }
      )
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const doc = await this.userCollection().doc(userId).get()
      if (!doc.exists) return null
      return { ...doc.data(), id: doc.id } as User
    } catch (error: any) {
      Log.error(TAG, `getUser error: ${error.message}`)
      return null
    }
  }

  async createUser(user: User): Promise<IResult> {
    try {
      await this.userCollection().doc(user.id).set(user)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createUser error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateUser(user: User): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(user.admin)
      await this.userCollection().doc(user.id).update(user as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateUser error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async setActiveHomestead(userId: string, homesteadId: string): Promise<IResult> {
    try {
      await this.userCollection().doc(userId).update({ activeHomesteadId: homesteadId })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `setActiveHomestead error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async uploadAvatar(userId: string, uri: string): Promise<{ url: string, ref: string } | null> {
    try {
      const path = `user/${userId}/avatar/${Date.now()}.jpg`
      const ref = storage().ref(path)
      await ref.putFile(uri)
      const url = await ref.getDownloadURL()
      return { url, ref: path }
    } catch (error: any) {
      Log.error(TAG, `uploadAvatar error: ${error.message}`)
      return null
    }
  }
}
