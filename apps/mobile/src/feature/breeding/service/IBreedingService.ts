import { IResult } from '../../../util/Result'
import BreedingRecord from '../../../schema/breeding/BreedingRecord'
import Animal from '../../../schema/animal/Animal'

export default interface IBreedingService {
  subscribeActiveBreedings(callback: (records: BreedingRecord[]) => void): () => void
  getBreedingRecordsForAnimal(animalId: string): Promise<BreedingRecord[]>
  createBreedingRecord(record: BreedingRecord): Promise<IResult>
  updateBreedingRecord(record: BreedingRecord): Promise<IResult>
  recordBirthOutcome(record: BreedingRecord, offspring: Animal[]): Promise<IResult>
  deleteBreedingRecord(id: string): Promise<IResult>
}
