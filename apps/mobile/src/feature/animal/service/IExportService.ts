import type Animal from '../../../schema/animal/Animal'
import type { AnimalAge } from '../../../util/AnimalUtility'
import type CareEvent from '../../../schema/care/CareEvent'
import type HealthRecord from '../../../schema/health/HealthRecord'
import type BreedingRecord from '../../../schema/breeding/BreedingRecord'
import type ProductionLog from '../../../schema/production/ProductionLog'
import type WeightLog from '../../../schema/weight/WeightLog'
import type Note from '../../../schema/notes/Note'
import type { WithdrawalResult } from '../../../util/WithdrawalUtility'
import type AnimalGroup from '../../../schema/animalGroup/AnimalGroup'
import type { IResult } from '../../../util/Result'

export interface ExportData {
  animal: Animal
  age: AnimalAge
  homesteadName: string
  healthRecords: HealthRecord[]
  careEvents: CareEvent[]
  breedingRecords: BreedingRecord[]
  productionLogs: ProductionLog[]
  weightLogs: WeightLog[]
  notes: Note[]
  activeWithdrawals: WithdrawalResult[]
  animals: Animal[]
  groups: AnimalGroup[]
}

export default interface IExportService {
  exportCompleteRecord(data: ExportData): Promise<IResult>
  exportHealthCareSummary(data: ExportData): Promise<IResult>
  exportBreedingLineageReport(data: ExportData): Promise<IResult>
}
