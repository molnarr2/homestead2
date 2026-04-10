import { IResult } from '../../../util/Result'
import Animal from '../../../schema/animal/Animal'

export default interface IAnimalService {
  subscribeAnimals(callback: (animals: Animal[]) => void): () => void
  getAnimal(id: string): Promise<Animal | null>
  createAnimal(animal: Animal): Promise<IResult>
  updateAnimal(animal: Animal): Promise<IResult>
  deleteAnimal(id: string): Promise<IResult>
  uploadAnimalPhoto(animalId: string, uri: string): Promise<{ url: string, ref: string } | null>
}
