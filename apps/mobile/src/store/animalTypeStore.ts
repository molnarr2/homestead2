import { create } from 'zustand'
import { IResult } from '../util/Result'
import AnimalType from '../schema/animalType/AnimalType'
import Breed from '../schema/animalType/Breed'
import CareTemplate from '../schema/animalType/CareTemplate'
import { bsAnimalTypeService } from '../Bootstrap'
import { useHomesteadStore } from './homesteadStore'
import { GESTATION_TABLE } from '../schema/type/GestationTable'

interface AnimalTypeState {
  animalTypes: AnimalType[]
  breeds: Record<string, Breed[]>
  careTemplates: Record<string, CareTemplate[]>
  loading: boolean
  subscribe: () => void
  teardown: () => void
  fetchBreeds: (animalTypeId: string) => Promise<void>
  fetchCareTemplates: (animalTypeId: string) => Promise<void>
  createAnimalType: (type: AnimalType) => Promise<IResult>
  createBreed: (animalTypeId: string, breed: Breed) => Promise<IResult>
  createCareTemplate: (animalTypeId: string, template: CareTemplate) => Promise<IResult>
  seedStarterPlaybooks: (species: string[]) => Promise<void>
  getGestationDays: (animalTypeId: string, breedId?: string) => number
  clear: () => void
}

export const useAnimalTypeStore = create<AnimalTypeState>((set, get) => ({
  animalTypes: [],
  breeds: {},
  careTemplates: {},
  loading: true,

  subscribe: async () => {
    set({ loading: true })
    const animalTypes = await bsAnimalTypeService.getAnimalTypes()
    set({ animalTypes, loading: false })
  },

  teardown: () => {},

  fetchBreeds: async (animalTypeId: string) => {
    const breeds = await bsAnimalTypeService.getBreedsForType(animalTypeId)
    set({ breeds: { ...get().breeds, [animalTypeId]: breeds } })
  },

  fetchCareTemplates: async (animalTypeId: string) => {
    const templates = await bsAnimalTypeService.getCareTemplatesForType(animalTypeId)
    set({ careTemplates: { ...get().careTemplates, [animalTypeId]: templates } })
  },

  createAnimalType: (type: AnimalType) => bsAnimalTypeService.createAnimalType(type),
  createBreed: (animalTypeId: string, breed: Breed) => bsAnimalTypeService.createBreed(animalTypeId, breed),
  createCareTemplate: (animalTypeId: string, template: CareTemplate) => bsAnimalTypeService.createCareTemplate(animalTypeId, template),

  seedStarterPlaybooks: async (species: string[]) => {
    const homesteadId = useHomesteadStore.getState().homesteadId
    await bsAnimalTypeService.seedStarterPlaybooks(homesteadId, species)
    const animalTypes = await bsAnimalTypeService.getAnimalTypes()
    set({ animalTypes })
  },

  getGestationDays: (animalTypeId: string, breedId?: string) => {
    if (breedId) {
      const typeBreeds = get().breeds[animalTypeId]
      const breed = typeBreeds?.find(b => b.id === breedId)
      if (breed && breed.gestationDays > 0) return breed.gestationDays
    }
    const animalType = get().animalTypes.find(t => t.id === animalTypeId)
    if (animalType) return GESTATION_TABLE[animalType.name] ?? 0
    return 0
  },

  clear: () => {
    set({ animalTypes: [], breeds: {}, careTemplates: {}, loading: true })
  },
}))
