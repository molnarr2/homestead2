import { create } from 'zustand'
import { IResult } from '../util/Result'
import Animal from '../schema/animal/Animal'
import { bsAnimalService } from '../Bootstrap'

interface AnimalState {
  animals: Animal[]
  loading: boolean
  unsubscribe: (() => void) | null
  subscribe: () => void
  teardown: () => void
  createAnimal: (animal: Animal) => Promise<IResult>
  updateAnimal: (animal: Animal) => Promise<IResult>
  deleteAnimal: (id: string) => Promise<IResult>
  getAnimalsByType: (animalTypeId: string) => Animal[]
  clear: () => void
}

export const useAnimalStore = create<AnimalState>((set, get) => ({
  animals: [],
  loading: true,
  unsubscribe: null,

  subscribe: () => {
    get().teardown()
    set({ loading: true })
    const unsub = bsAnimalService.subscribeAnimals((animals) => {
      set({ animals, loading: false })
    })
    set({ unsubscribe: unsub })
  },

  teardown: () => {
    const unsub = get().unsubscribe
    if (unsub) unsub()
    set({ unsubscribe: null })
  },

  createAnimal: (animal: Animal) => bsAnimalService.createAnimal(animal),
  updateAnimal: (animal: Animal) => bsAnimalService.updateAnimal(animal),
  deleteAnimal: (id: string) => bsAnimalService.deleteAnimal(id),

  getAnimalsByType: (animalTypeId: string) => {
    return get().animals.filter(a => a.animalTypeId === animalTypeId)
  },

  clear: () => {
    get().teardown()
    set({ animals: [], loading: true, unsubscribe: null })
  },
}))
