import { IResult } from '../../../util/Result'
import Feedback from '../../../schema/feedback/Feedback'

export default interface IProfileService {
  submitFeedback(feedback: Feedback): Promise<IResult>
}
