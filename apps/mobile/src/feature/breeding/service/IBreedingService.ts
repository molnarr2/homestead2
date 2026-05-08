import { IResult } from '../../../util/Result'
import BreedingRecord, { BirthOutcome } from '../../../schema/breeding/BreedingRecord'
import Animal from '../../../schema/animal/Animal'

export default interface IBreedingService {
  subscribe(callback: (records: BreedingRecord[]) => void): () => void
  getBreedingRecordsForAnimal(animalId: string): Promise<BreedingRecord[]>
  createBreedingRecord(record: BreedingRecord): Promise<IResult>
  updateBreedingRecord(record: BreedingRecord): Promise<IResult>
  completeBirth(recordId: string, outcome: BirthOutcome, dam: Animal): Promise<IResult>
  failBreeding(recordId: string): Promise<IResult>
  deleteBreedingRecord(id: string): Promise<IResult>
}
