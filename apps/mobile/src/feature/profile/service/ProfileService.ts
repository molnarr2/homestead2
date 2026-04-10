import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_default } from '../../../schema/object/AdminObject'
import Feedback from '../../../schema/feedback/Feedback'
import Log from '../../../library/log/Log'
import IProfileService from './IProfileService'

const TAG = 'ProfileService'

export default class ProfileService implements IProfileService {

  async updateAvatar(userId: string, photoUri: string): Promise<IResult> {
    try {
      const storagePath = `user/${userId}/avatar/${Date.now()}.jpg`
      await storage().ref(storagePath).putFile(photoUri)
      const downloadUrl = await storage().ref(storagePath).getDownloadURL()

      await firestore().collection('user').doc(userId).update({
        photoStorageRef: storagePath,
        avatarUrl: downloadUrl,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateAvatar error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async submitFeedback(feedback: Feedback): Promise<IResult> {
    try {
      const ref = firestore().collection('feedback').doc()
      await ref.set({
        ...feedback,
        id: ref.id,
        admin: adminObject_default(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `submitFeedback error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }
}
