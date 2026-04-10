import { IResult } from '../../../util/Result'
import WeightLog from '../../../schema/weight/WeightLog'

export default interface IWeightService {
  getWeightLogsForAnimal(animalId: string): Promise<WeightLog[]>
  createWeightLog(log: WeightLog): Promise<IResult>
  updateWeightLog(log: WeightLog): Promise<IResult>
  deleteWeightLog(id: string): Promise<IResult>
}
