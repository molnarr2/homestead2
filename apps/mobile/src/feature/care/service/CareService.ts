import firestore from '@react-native-firebase/firestore'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_default, adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import CareEvent from '../../../schema/care/CareEvent'
import { dateToTstamp } from '../../../schema/type/Tstamp'
import { calculateNextDueDate } from '../../../util/CareUtility'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import ICareService from './ICareService'
import { Col } from '@template/common'

const TAG = 'CareService'

export default class CareService implements ICareService {

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection(Col.homestead).doc(homesteadId)
  }

  subscribeCareEvents(callback: (events: CareEvent[]) => void): () => void {
    return this.homesteadRef
      .collection(Col.careEvent)
      .where('admin.deleted', '==', false)
      .onSnapshot(
        snapshot => {
          const events: CareEvent[] = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          } as CareEvent))
          callback(events)
        },
        error => {
          Log.error(TAG, `onSnapshot error: ${error.message}`)
          callback([])
        }
      )
  }

  async getCareEvent(id: string): Promise<CareEvent | null> {
    try {
      const doc = await this.homesteadRef.collection(Col.careEvent).doc(id).get()
      if (!doc.exists) return null
      return { ...doc.data(), id: doc.id } as CareEvent
    } catch (error: any) {
      Log.error(TAG, `getCareEvent error: ${error.message}`)
      return null
    }
  }

  async createCareEvent(event: CareEvent): Promise<IResult> {
    try {
      const ref = this.homesteadRef.collection(Col.careEvent).doc()
      event.id = ref.id
      await ref.set(event as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createCareEvent error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateCareEvent(event: CareEvent): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(event.admin)
      await this.homesteadRef.collection(Col.careEvent).doc(event.id).update(event as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateCareEvent error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async completeCareEvent(event: CareEvent): Promise<IResult> {
    try {
      const batch = firestore().batch()
      const completedDate = dateToTstamp(new Date())

      const eventRef = this.homesteadRef.collection(Col.careEvent).doc(event.id)
      batch.update(eventRef, {
        completedDate,
        createdNextRecurringEvent: event.type === 'careRecurring',
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })

      if (event.type === 'careRecurring' && !event.createdNextRecurringEvent) {
        const nextDueDate = calculateNextDueDate(completedDate, event.cycle)
        const nextEventRef = this.homesteadRef.collection(Col.careEvent).doc()
        const nextEvent: CareEvent = {
          id: nextEventRef.id,
          animalId: event.animalId,
          templateId: event.templateId,
          name: event.name,
          type: event.type,
          cycle: event.cycle,
          dueDate: dateToTstamp(nextDueDate),
          completedDate: null,
          contactName: event.contactName,
          contactPhone: event.contactPhone,
          notes: event.notes,
          photoStorageRef: '',
          photoUrl: '',
          createdNextRecurringEvent: false,
          admin: adminObject_default(),
        }
        batch.set(nextEventRef, nextEvent as any)
      }

      await batch.commit()
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `completeCareEvent error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteCareEvent(id: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection(Col.careEvent).doc(id).update({
        'admin.deleted': true,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `deleteCareEvent error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }
}
