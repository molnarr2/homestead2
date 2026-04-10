import { IResult } from '../../../util/Result'
import AnimalType from '../../../schema/animalType/AnimalType'
import Breed from '../../../schema/animalType/Breed'
import CareTemplate from '../../../schema/animalType/CareTemplate'
import EventTemplate from '../../../schema/animalType/EventTemplate'

export default interface IAnimalTypeService {
  getAnimalTypes(): Promise<AnimalType[]>
  createAnimalType(animalType: AnimalType): Promise<IResult>
  updateAnimalType(animalType: AnimalType): Promise<IResult>
  deleteAnimalType(id: string): Promise<IResult>

  getBreedsForType(animalTypeId: string): Promise<Breed[]>
  createBreed(animalTypeId: string, breed: Breed): Promise<IResult>
  updateBreed(animalTypeId: string, breed: Breed): Promise<IResult>
  deleteBreed(animalTypeId: string, breedId: string): Promise<IResult>

  getCareTemplatesForType(animalTypeId: string): Promise<CareTemplate[]>
  createCareTemplate(animalTypeId: string, template: CareTemplate): Promise<IResult>
  updateCareTemplate(animalTypeId: string, template: CareTemplate): Promise<IResult>
  deleteCareTemplate(animalTypeId: string, templateId: string): Promise<IResult>

  getEventTemplatesForType(animalTypeId: string): Promise<EventTemplate[]>
  createEventTemplate(animalTypeId: string, template: EventTemplate): Promise<IResult>
  updateEventTemplate(animalTypeId: string, template: EventTemplate): Promise<IResult>
  deleteEventTemplate(animalTypeId: string, templateId: string): Promise<IResult>

  seedStarterPlaybooks(homesteadId: string, selectedSpecies: string[]): Promise<IResult>
}
