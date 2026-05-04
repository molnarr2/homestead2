import { create } from 'zustand'
import { IResult } from '../util/Result'
import AnimalType, { AnimalTypeBreed, AnimalTypeCareTemplate, AnimalTypeEventTemplate } from '../schema/animalType/AnimalType'
import { bsAuthService, bsAnimalTypeService } from '../Bootstrap'
import { useHomesteadStore } from './homesteadStore'
import { GESTATION_TABLE } from '../schema/type/GestationTable'

interface AnimalTypeState {
  animalTypes: AnimalType[]
  loading: boolean
  _unsubscribe: (() => void) | null
  subscribe: () => void
  teardown: () => void
  createAnimalType: (type: AnimalType) => Promise<IResult>
  addBreed: (animalTypeId: string, breed: Omit<AnimalTypeBreed, 'id'>) => Promise<IResult>
  updateBreed: (animalTypeId: string, breed: AnimalTypeBreed) => Promise<IResult>
  deleteBreed: (animalTypeId: string, breedId: string) => Promise<IResult>
  addCareTemplate: (animalTypeId: string, template: Omit<AnimalTypeCareTemplate, 'id'>) => Promise<IResult>
  updateCareTemplate: (animalTypeId: string, template: AnimalTypeCareTemplate) => Promise<IResult>
  deleteCareTemplate: (animalTypeId: string, templateId: string) => Promise<IResult>
  addEventTemplate: (animalTypeId: string, template: Omit<AnimalTypeEventTemplate, 'id'>) => Promise<IResult>
  updateEventTemplate: (animalTypeId: string, template: AnimalTypeEventTemplate) => Promise<IResult>
  deleteEventTemplate: (animalTypeId: string, templateId: string) => Promise<IResult>
  seedStarterPlaybooks: (species: string[]) => Promise<void>
  getGestationDays: (animalTypeId: string, breedId?: string) => number
  clear: () => void
}

export const useAnimalTypeStore = create<AnimalTypeState>((set, get) => ({
  animalTypes: [],
  loading: true,
  _unsubscribe: null,

  subscribe: () => {
    get().teardown()
    set({ loading: true })
    const unsubscribe = bsAnimalTypeService.subscribeToAnimalTypes((animalTypes) => {
      set({ animalTypes, loading: false })
    })
    set({ _unsubscribe: unsubscribe })
  },

  teardown: () => {
    const unsub = get()._unsubscribe
    if (unsub) {
      unsub()
      set({ _unsubscribe: null })
    }
  },

  createAnimalType: (type: AnimalType) => bsAnimalTypeService.createAnimalType(type),

  addBreed: (animalTypeId, breed) => bsAnimalTypeService.addBreed(animalTypeId, breed),
  updateBreed: (animalTypeId, breed) => bsAnimalTypeService.updateBreed(animalTypeId, breed),
  deleteBreed: (animalTypeId, breedId) => bsAnimalTypeService.deleteBreed(animalTypeId, breedId),

  addCareTemplate: (animalTypeId, template) => bsAnimalTypeService.addCareTemplate(animalTypeId, template),
  updateCareTemplate: (animalTypeId, template) => bsAnimalTypeService.updateCareTemplate(animalTypeId, template),
  deleteCareTemplate: (animalTypeId, templateId) => bsAnimalTypeService.deleteCareTemplate(animalTypeId, templateId),

  addEventTemplate: (animalTypeId, template) => bsAnimalTypeService.addEventTemplate(animalTypeId, template),
  updateEventTemplate: (animalTypeId, template) => bsAnimalTypeService.updateEventTemplate(animalTypeId, template),
  deleteEventTemplate: (animalTypeId, templateId) => bsAnimalTypeService.deleteEventTemplate(animalTypeId, templateId),

  seedStarterPlaybooks: async (species: string[]) => {
    const homesteadId = useHomesteadStore.getState().homesteadId
    const userId = bsAuthService.currentUserId
    await bsAnimalTypeService.seedStarterPlaybooks(homesteadId, species, userId)
    const animalTypes = await bsAnimalTypeService.getAnimalTypes()
    set({ animalTypes })
  },

  getGestationDays: (animalTypeId: string, breedId?: string) => {
    if (breedId) {
      const animalType = get().animalTypes.find(t => t.id === animalTypeId)
      const breed = animalType?.breeds.find(b => b.id === breedId)
      if (breed && breed.gestationDays > 0) return breed.gestationDays
    }
    const animalType = get().animalTypes.find(t => t.id === animalTypeId)
    if (animalType) return GESTATION_TABLE[animalType.name] ?? 0
    return 0
  },

  clear: () => {
    get().teardown()
    set({ animalTypes: [], loading: true, _unsubscribe: null })
  },
}))
