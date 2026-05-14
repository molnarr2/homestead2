import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_default, adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import HealthRecord from '../../../schema/health/HealthRecord'
import ICareService from '../../care/service/ICareService'
import IHealthService from './IHealthService'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import { careEvent_default } from '../../../schema/care/CareEvent'
import { dateToTstamp } from '../../../schema/type/Tstamp'
import { Col } from '@template/common'

const TAG = 'HealthService'

export default class HealthService implements IHealthService {
  private careService: ICareService

  constructor(careService: ICareService) {
    this.careService = careService
  }

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection(Col.homestead).doc(homesteadId)
  }

  subscribeHealthRecords(callback: (records: HealthRecord[]) => void): () => void {
    return this.homesteadRef
      .collection(Col.healthRecord)
      .where('admin.deleted', '==', false)
      .onSnapshot(
        snapshot => {
          const records: HealthRecord[] = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          } as HealthRecord))
          callback(records)
        },
        error => {
          Log.error(TAG, `subscribeHealthRecords error: ${error.message}`)
          callback([])
        }
      )
  }

  async createHealthRecord(record: HealthRecord, photoUri?: string): Promise<IResult> {
    try {
      const docRef = this.homesteadRef.collection(Col.healthRecord).doc()
      record.id = docRef.id
      record.admin = adminObject_default()

      if (photoUri) {
        const homesteadId = this.homesteadRef.id
        const storagePath = `homestead/${homesteadId}/healthRecord/${record.id}/photo.jpg`
        await storage().ref(storagePath).putFile(photoUri)
        const downloadUrl = await storage().ref(storagePath).getDownloadURL()
        record.photoStorageRef = storagePath
        record.photoUrl = downloadUrl
      }

      await docRef.set(record as any)

      if (record.recordType === 'vaccination' && record.vaccineNextDueDate) {
        await this.careService.createCareEvent({
          ...careEvent_default(),
          animalId: record.animalId,
          templateId: '',
          name: `Vaccination: ${record.name}`,
          type: 'careSingle',
          cycle: 0,
          dueDate: dateToTstamp(new Date(record.vaccineNextDueDate)),
          completedDate: null,
          contactName: record.providerName ?? '',
          contactPhone: record.providerPhone ?? '',
          notes: 'Auto-created from vaccination record',
          photoStorageRef: '',
          photoUrl: '',
          createdNextRecurringEvent: false,
        })
      }

      if (record.recordType === 'vetVisit' && record.vetFollowUpDate) {
        await this.careService.createCareEvent({
          ...careEvent_default(),
          animalId: record.animalId,
          templateId: '',
          name: `Vet Follow-Up: ${record.name}`,
          type: 'careSingle',
          cycle: 0,
          dueDate: dateToTstamp(new Date(record.vetFollowUpDate)),
          completedDate: null,
          contactName: record.providerName ?? '',
          contactPhone: record.providerPhone ?? '',
          notes: 'Auto-created from vet visit record',
          photoStorageRef: '',
          photoUrl: '',
          createdNextRecurringEvent: false,
        })
      }

      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, 'createHealthRecord error: ' + error.message)
      return ErrorResult(error.message)
    }
  }

  async updateHealthRecord(record: HealthRecord, photoUri?: string): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(record.admin)

      if (photoUri) {
        const homesteadId = this.homesteadRef.id
        const storagePath = `homestead/${homesteadId}/healthRecord/${record.id}/photo.jpg`
        await storage().ref(storagePath).putFile(photoUri)
        const downloadUrl = await storage().ref(storagePath).getDownloadURL()
        record.photoStorageRef = storagePath
        record.photoUrl = downloadUrl
      }

      await this.homesteadRef.collection(Col.healthRecord).doc(record.id).update(record as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, 'updateHealthRecord error: ' + error.message)
      return ErrorResult(error.message)
    }
  }
}
