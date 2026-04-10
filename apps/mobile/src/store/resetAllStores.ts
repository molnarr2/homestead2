import { useHomesteadStore } from './homesteadStore'
import { useUserStore } from './userStore'
import { useAnimalStore } from './animalStore'
import { useCareStore } from './careStore'
import { useHealthStore } from './healthStore'
import { useBreedingStore } from './breedingStore'
import { useProductionStore } from './productionStore'
import { useNoteStore } from './noteStore'
import { useWeightStore } from './weightStore'
import { useAnimalTypeStore } from './animalTypeStore'

export function resetAllStores() {
  useAnimalStore.getState().clear()
  useCareStore.getState().clear()
  useHealthStore.getState().clear()
  useBreedingStore.getState().clear()
  useProductionStore.getState().clear()
  useNoteStore.getState().clear()
  useWeightStore.getState().clear()
  useAnimalTypeStore.getState().clear()
  useUserStore.getState().clear()
  useHomesteadStore.getState().clear()
}
