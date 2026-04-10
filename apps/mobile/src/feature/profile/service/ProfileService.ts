import firestore from '@react-native-firebase/firestore'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import Feedback from '../../../schema/feedback/Feedback'
import Log from '../../../library/log/Log'
import IProfileService from './IProfileService'

const TAG = 'ProfileService'

export default class ProfileService implements IProfileService {

  async submitFeedback(feedback: Feedback): Promise<IResult> {
    try {
      const ref = firestore().collection('feedback').doc()
      feedback.id = ref.id
      await ref.set(feedback as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `submitFeedback error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }
}
