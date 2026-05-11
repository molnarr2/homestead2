import firestore from '@react-native-firebase/firestore'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_default, adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import AnimalType, { AnimalTypeBreed, AnimalTypeCareTemplate } from '../../../schema/animalType/AnimalType'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import IAnimalTypeService from './IAnimalTypeService'
import { STARTER_PLAYBOOKS } from '../data/StarterPlaybooks'
import { Col } from '@template/common'

const TAG = 'AnimalTypeService'

export default class AnimalTypeService implements IAnimalTypeService {

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection(Col.homestead).doc(homesteadId)
  }

  private animalTypeCollection() {
    return this.homesteadRef.collection(Col.animalType)
  }

  private generateId(): string {
    return firestore().collection('_').doc().id
  }

  subscribeToAnimalTypes(callback: (types: AnimalType[]) => void): () => void {
    return this.animalTypeCollection()
      .where('admin.deleted', '==', false)
      .onSnapshot(
        snapshot => {
          const types = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          } as AnimalType))
          callback(types)
        },
        error => {
          Log.error(TAG, `subscribeToAnimalTypes error: ${error.message}`)
          callback([])
        },
      )
  }

  async fetchAnimalType(animalTypeId: string): Promise<AnimalType | null> {
    try {
      const doc = await this.animalTypeCollection().doc(animalTypeId).get()
      if (!doc.exists) return null
      return { ...doc.data(), id: doc.id } as AnimalType
    } catch (error: any) {
      Log.error(TAG, `fetchAnimalType error: ${error.message}`)
      return null
    }
  }

  async getAnimalTypes(): Promise<AnimalType[]> {
    try {
      const snapshot = await this.animalTypeCollection()
        .where('admin.deleted', '==', false)
        .get()

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as AnimalType))
    } catch (error: any) {
      Log.error(TAG, `getAnimalTypes error: ${error.message}`)
      return []
    }
  }

  async createAnimalType(animalType: AnimalType): Promise<IResult> {
    try {
      const ref = this.animalTypeCollection().doc()
      animalType.id = ref.id
      await ref.set(animalType as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createAnimalType error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateAnimalType(animalType: AnimalType): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(animalType.admin)
      await this.animalTypeCollection().doc(animalType.id).update(animalType as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateAnimalType error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteAnimalType(id: string): Promise<IResult> {
    try {
      await this.animalTypeCollection().doc(id).update({
        'admin.deleted': true,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `deleteAnimalType error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  // --- Breed array mutations ---

  async addBreed(animalTypeId: string, breed: Omit<AnimalTypeBreed, 'id'>): Promise<IResult> {
    try {
      const doc = await this.animalTypeCollection().doc(animalTypeId).get()
      if (!doc.exists) return ErrorResult('Animal type not found')
      const animalType = { ...doc.data(), id: doc.id } as AnimalType
      animalType.breeds.push({ ...breed, id: this.generateId() })
      return this.updateAnimalType(animalType)
    } catch (error: any) {
      Log.error(TAG, `addBreed error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateBreed(animalTypeId: string, breed: AnimalTypeBreed): Promise<IResult> {
    try {
      const doc = await this.animalTypeCollection().doc(animalTypeId).get()
      if (!doc.exists) return ErrorResult('Animal type not found')
      const animalType = { ...doc.data(), id: doc.id } as AnimalType
      animalType.breeds = animalType.breeds.map(b => b.id === breed.id ? breed : b)
      return this.updateAnimalType(animalType)
    } catch (error: any) {
      Log.error(TAG, `updateBreed error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteBreed(animalTypeId: string, breedId: string): Promise<IResult> {
    try {
      const doc = await this.animalTypeCollection().doc(animalTypeId).get()
      if (!doc.exists) return ErrorResult('Animal type not found')
      const animalType = { ...doc.data(), id: doc.id } as AnimalType
      animalType.breeds = animalType.breeds.filter(b => b.id !== breedId)
      return this.updateAnimalType(animalType)
    } catch (error: any) {
      Log.error(TAG, `deleteBreed error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  // --- CareTemplate array mutations ---

  async addCareTemplate(animalTypeId: string, template: Omit<AnimalTypeCareTemplate, 'id'>): Promise<IResult> {
    try {
      const doc = await this.animalTypeCollection().doc(animalTypeId).get()
      if (!doc.exists) return ErrorResult('Animal type not found')
      const animalType = { ...doc.data(), id: doc.id } as AnimalType
      animalType.careTemplates.push({ ...template, id: this.generateId() })
      return this.updateAnimalType(animalType)
    } catch (error: any) {
      Log.error(TAG, `addCareTemplate error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateCareTemplate(animalTypeId: string, template: AnimalTypeCareTemplate): Promise<IResult> {
    try {
      const doc = await this.animalTypeCollection().doc(animalTypeId).get()
      if (!doc.exists) return ErrorResult('Animal type not found')
      const animalType = { ...doc.data(), id: doc.id } as AnimalType
      animalType.careTemplates = animalType.careTemplates.map(t => t.id === template.id ? template : t)
      return this.updateAnimalType(animalType)
    } catch (error: any) {
      Log.error(TAG, `updateCareTemplate error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteCareTemplate(animalTypeId: string, templateId: string): Promise<IResult> {
    try {
      const doc = await this.animalTypeCollection().doc(animalTypeId).get()
      if (!doc.exists) return ErrorResult('Animal type not found')
      const animalType = { ...doc.data(), id: doc.id } as AnimalType
      animalType.careTemplates = animalType.careTemplates.filter(t => t.id !== templateId)
      return this.updateAnimalType(animalType)
    } catch (error: any) {
      Log.error(TAG, `deleteCareTemplate error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  // --- Seeding ---

  async seedStarterPlaybooks(homesteadId: string, selectedSpecies: string[], userId: string): Promise<IResult> {
    try {
      const batch = firestore().batch()
      const seedRef = firestore().collection(Col.homestead).doc(homesteadId)

      for (const species of selectedSpecies) {
        const playbook = STARTER_PLAYBOOKS[species]
        const typeRef = seedRef.collection(Col.animalType).doc()

        const animalType: any = {
          id: typeRef.id,
          admin: adminObject_default(),
          name: species,
          colors: playbook?.colors ?? [],
          breeds: (playbook?.breeds ?? []).map(b => ({
            id: this.generateId(),
            name: b.name,
            gestationDays: b.gestationDays ?? 0,
          })),
          careTemplates: (playbook?.careTemplates ?? []).map(t => ({
            id: this.generateId(),
            name: t.name,
            type: t.type,
            cycle: t.cycle,
            contactName: '',
            contactPhone: '',
          })),
        }

        batch.set(typeRef, animalType)
      }

      batch.update(firestore().collection(Col.user).doc(userId), {
        selectedSpecies,
      })

      await batch.commit()
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `seedStarterPlaybooks error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

}
