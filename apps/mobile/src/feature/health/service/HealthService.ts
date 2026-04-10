import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_default } from '../../../schema/object/AdminObject'
import HealthRecord from '../../../schema/health/HealthRecord'
import ICareService from '../../care/service/ICareService'
import IHealthService from './IHealthService'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import { careEvent_default } from '../../../schema/care/CareEvent'
import { dateToTstamp } from '../../../schema/type/Tstamp'

const TAG = 'HealthService'

export default class HealthService implements IHealthService {
  private careService: ICareService

  constructor(careService: ICareService) {
    this.careService = careService
  }

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection('homestead').doc(homesteadId)
  }

  async fetchHealthRecordsByAnimal(animalId: string): Promise<HealthRecord[]> {
    try {
      const snapshot = await this.homesteadRef
        .collection('healthRecord')
        .where('animalId', '==', animalId)
        .where('admin.deleted', '==', false)
        .orderBy('date', 'desc')
        .get()

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as HealthRecord))
    } catch (error: any) {
      Log.error(TAG, 'fetchHealthRecordsByAnimal error: ' + error.message)
      return []
    }
  }

  async fetchAllWithdrawalRecords(): Promise<HealthRecord[]> {
    try {
      const snapshot = await this.homesteadRef
        .collection('healthRecord')
        .where('admin.deleted', '==', false)
        .where('withdrawalPeriodDays', '>', 0)
        .get()

      const medicationRecords = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as HealthRecord))

      const dewormSnapshot = await this.homesteadRef
        .collection('healthRecord')
        .where('admin.deleted', '==', false)
        .where('dewormingWithdrawalDays', '>', 0)
        .get()

      const dewormRecords = dewormSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as HealthRecord))

      const seen = new Set<string>()
      const combined: HealthRecord[] = []
      for (const r of [...medicationRecords, ...dewormRecords]) {
        if (!seen.has(r.id)) {
          seen.add(r.id)
          combined.push(r)
        }
      }
      return combined
    } catch (error: any) {
      Log.error(TAG, 'fetchAllWithdrawalRecords error: ' + error.message)
      return []
    }
  }

  async createHealthRecord(record: HealthRecord, photoUri?: string): Promise<IResult> {
    try {
      const docRef = this.homesteadRef.collection('healthRecord').doc()
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

      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, 'createHealthRecord error: ' + error.message)
      return ErrorResult(error.message)
    }
  }
}
