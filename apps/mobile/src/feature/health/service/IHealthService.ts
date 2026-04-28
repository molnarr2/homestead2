import { IResult } from '../../../util/Result'
import HealthRecord from '../../../schema/health/HealthRecord'

export default interface IHealthService {
  subscribeHealthRecords(callback: (records: HealthRecord[]) => void): () => void
  createHealthRecord(record: HealthRecord, photoUri?: string): Promise<IResult>
}
