import firestore from '@react-native-firebase/firestore'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import AnimalType from '../../../schema/animalType/AnimalType'
import Breed from '../../../schema/animalType/Breed'
import CareTemplate from '../../../schema/animalType/CareTemplate'
import EventTemplate from '../../../schema/animalType/EventTemplate'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import IAnimalTypeService from './IAnimalTypeService'

const TAG = 'AnimalTypeService'

export default class AnimalTypeService implements IAnimalTypeService {

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection('homestead').doc(homesteadId)
  }

  private animalTypeCollection() {
    return this.homesteadRef.collection('animalType')
  }

  private breedCollection(animalTypeId: string) {
    return this.animalTypeCollection().doc(animalTypeId).collection('breed')
  }

  private careTemplateCollection(animalTypeId: string) {
    return this.animalTypeCollection().doc(animalTypeId).collection('careTemplate')
  }

  private eventTemplateCollection(animalTypeId: string) {
    return this.animalTypeCollection().doc(animalTypeId).collection('eventTemplate')
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

  async getBreedsForType(animalTypeId: string): Promise<Breed[]> {
    try {
      const snapshot = await this.breedCollection(animalTypeId)
        .where('admin.deleted', '==', false)
        .get()

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as Breed))
    } catch (error: any) {
      Log.error(TAG, `getBreedsForType error: ${error.message}`)
      return []
    }
  }

  async createBreed(animalTypeId: string, breed: Breed): Promise<IResult> {
    try {
      const ref = this.breedCollection(animalTypeId).doc()
      breed.id = ref.id
      await ref.set(breed as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createBreed error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateBreed(animalTypeId: string, breed: Breed): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(breed.admin)
      await this.breedCollection(animalTypeId).doc(breed.id).update(breed as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateBreed error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteBreed(animalTypeId: string, breedId: string): Promise<IResult> {
    try {
      await this.breedCollection(animalTypeId).doc(breedId).update({
        'admin.deleted': true,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `deleteBreed error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async getCareTemplatesForType(animalTypeId: string): Promise<CareTemplate[]> {
    try {
      const snapshot = await this.careTemplateCollection(animalTypeId)
        .where('admin.deleted', '==', false)
        .get()

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as CareTemplate))
    } catch (error: any) {
      Log.error(TAG, `getCareTemplatesForType error: ${error.message}`)
      return []
    }
  }

  async createCareTemplate(animalTypeId: string, template: CareTemplate): Promise<IResult> {
    try {
      const ref = this.careTemplateCollection(animalTypeId).doc()
      template.id = ref.id
      await ref.set(template as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createCareTemplate error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateCareTemplate(animalTypeId: string, template: CareTemplate): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(template.admin)
      await this.careTemplateCollection(animalTypeId).doc(template.id).update(template as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateCareTemplate error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteCareTemplate(animalTypeId: string, templateId: string): Promise<IResult> {
    try {
      await this.careTemplateCollection(animalTypeId).doc(templateId).update({
        'admin.deleted': true,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `deleteCareTemplate error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async getEventTemplatesForType(animalTypeId: string): Promise<EventTemplate[]> {
    try {
      const snapshot = await this.eventTemplateCollection(animalTypeId)
        .where('admin.deleted', '==', false)
        .get()

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as EventTemplate))
    } catch (error: any) {
      Log.error(TAG, `getEventTemplatesForType error: ${error.message}`)
      return []
    }
  }

  async createEventTemplate(animalTypeId: string, template: EventTemplate): Promise<IResult> {
    try {
      const ref = this.eventTemplateCollection(animalTypeId).doc()
      template.id = ref.id
      await ref.set(template as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createEventTemplate error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateEventTemplate(animalTypeId: string, template: EventTemplate): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(template.admin)
      await this.eventTemplateCollection(animalTypeId).doc(template.id).update(template as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateEventTemplate error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteEventTemplate(animalTypeId: string, templateId: string): Promise<IResult> {
    try {
      await this.eventTemplateCollection(animalTypeId).doc(templateId).update({
        'admin.deleted': true,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `deleteEventTemplate error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async seedStarterPlaybooks(homesteadId: string, selectedSpecies: string[]): Promise<IResult> {
    try {
      const batch = firestore().batch()
      const homesteadRef = firestore().collection('homestead').doc(homesteadId)

      for (const species of selectedSpecies) {
        const typeRef = homesteadRef.collection('animalType').doc()
        const animalType: AnimalType = {
          id: typeRef.id,
          admin: {
            deleted: false,
            updated_at: firestore.FieldValue.serverTimestamp(),
            created_at: firestore.FieldValue.serverTimestamp(),
          },
          name: species,
          colors: [],
        }
        batch.set(typeRef, animalType as any)
      }

      await batch.commit()
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `seedStarterPlaybooks error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }
}
