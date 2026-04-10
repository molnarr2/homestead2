import { IResult } from '../../../util/Result'
import Feedback from '../../../schema/feedback/Feedback'

export default interface IProfileService {
  updateAvatar(userId: string, photoUri: string): Promise<IResult>
  submitFeedback(feedback: Feedback): Promise<IResult>
}
