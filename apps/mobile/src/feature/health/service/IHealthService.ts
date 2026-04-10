import { IResult } from '../../../util/Result'
import HealthRecord from '../../../schema/health/HealthRecord'

export default interface IHealthService {
  getHealthRecordsForAnimal(animalId: string): Promise<HealthRecord[]>
  getActiveWithdrawalRecords(): Promise<HealthRecord[]>
  subscribeActiveWithdrawals(callback: (records: HealthRecord[]) => void): () => void
  createHealthRecord(record: HealthRecord): Promise<IResult>
  updateHealthRecord(record: HealthRecord): Promise<IResult>
  deleteHealthRecord(id: string): Promise<IResult>
}
