import { IResult } from '../../../util/Result'
import WeightLog from '../../../schema/weight/WeightLog'

export default interface IWeightService {
  subscribeWeightLogs(callback: (logs: WeightLog[]) => void): () => void
  createWeightLog(log: WeightLog): Promise<IResult>
  updateWeightLog(log: WeightLog): Promise<IResult>
  deleteWeightLog(id: string): Promise<IResult>
}
