import { IResult } from '../../../util/Result'
import HealthRecord from '../../../schema/health/HealthRecord'

export default interface IHealthService {
  fetchHealthRecordsByAnimal(animalId: string): Promise<HealthRecord[]>
  fetchAllWithdrawalRecords(): Promise<HealthRecord[]>
  createHealthRecord(record: HealthRecord, photoUri?: string): Promise<IResult>
}
