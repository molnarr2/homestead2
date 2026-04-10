import { IResult } from '../../../util/Result'
import CareEvent from '../../../schema/care/CareEvent'

export default interface ICareService {
  subscribeCareEvents(callback: (events: CareEvent[]) => void): () => void
  getCareEvent(id: string): Promise<CareEvent | null>
  createCareEvent(event: CareEvent): Promise<IResult>
  updateCareEvent(event: CareEvent): Promise<IResult>
  completeCareEvent(event: CareEvent): Promise<IResult>
  deleteCareEvent(id: string): Promise<IResult>
}
