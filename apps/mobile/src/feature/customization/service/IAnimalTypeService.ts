import { IResult } from '../../../util/Result'
import AnimalType, { AnimalTypeBreed, AnimalTypeCareTemplate, AnimalTypeEventTemplate } from '../../../schema/animalType/AnimalType'

export default interface IAnimalTypeService {
  subscribeToAnimalTypes(callback: (types: AnimalType[]) => void): () => void
  getAnimalTypes(): Promise<AnimalType[]>
  fetchAnimalType(animalTypeId: string): Promise<AnimalType | null>
  createAnimalType(animalType: AnimalType): Promise<IResult>
  updateAnimalType(animalType: AnimalType): Promise<IResult>
  deleteAnimalType(id: string): Promise<IResult>

  addBreed(animalTypeId: string, breed: Omit<AnimalTypeBreed, 'id'>): Promise<IResult>
  updateBreed(animalTypeId: string, breed: AnimalTypeBreed): Promise<IResult>
  deleteBreed(animalTypeId: string, breedId: string): Promise<IResult>

  addCareTemplate(animalTypeId: string, template: Omit<AnimalTypeCareTemplate, 'id'>): Promise<IResult>
  updateCareTemplate(animalTypeId: string, template: AnimalTypeCareTemplate): Promise<IResult>
  deleteCareTemplate(animalTypeId: string, templateId: string): Promise<IResult>

  addEventTemplate(animalTypeId: string, template: Omit<AnimalTypeEventTemplate, 'id'>): Promise<IResult>
  updateEventTemplate(animalTypeId: string, template: AnimalTypeEventTemplate): Promise<IResult>
  deleteEventTemplate(animalTypeId: string, templateId: string): Promise<IResult>

  seedStarterPlaybooks(homesteadId: string, selectedSpecies: string[], userId: string): Promise<IResult>
}
