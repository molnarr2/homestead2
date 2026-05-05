import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_default, adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import AnimalGroup from '../../../schema/animalGroup/AnimalGroup'
import CareEvent from '../../../schema/care/CareEvent'
import HealthRecord from '../../../schema/health/HealthRecord'
import IGroupService from './IGroupService'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import { Col } from '@template/common'

const TAG = 'GroupService'

export default class GroupService implements IGroupService {

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection(Col.homestead).doc(homesteadId)
  }

  subscribeGroups(callback: (groups: AnimalGroup[]) => void): () => void {
    return this.homesteadRef
      .collection(Col.animalGroup)
      .where('admin.deleted', '==', false)
      .onSnapshot(
        snapshot => {
          const groups: AnimalGroup[] = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          } as AnimalGroup))
          callback(groups)
        },
        error => {
          Log.error(TAG, `subscribeGroups error: ${error.message}`)
          callback([])
        }
      )
  }

  subscribeGroupCareEvents(groupId: string, callback: (events: CareEvent[]) => void): () => void {
    return this.homesteadRef
      .collection(Col.animalGroup)
      .doc(groupId)
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
          Log.error(TAG, `subscribeGroupCareEvents error: ${error.message}`)
          callback([])
        }
      )
  }

  subscribeGroupHealthRecords(groupId: string, callback: (records: HealthRecord[]) => void): () => void {
    return this.homesteadRef
      .collection(Col.animalGroup)
      .doc(groupId)
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
          Log.error(TAG, `subscribeGroupHealthRecords error: ${error.message}`)
          callback([])
        }
      )
  }

  async createGroup(group: AnimalGroup, photoUri?: string): Promise<IResult> {
    try {
      const ref = this.homesteadRef.collection(Col.animalGroup).doc()
      group.id = ref.id
      group.admin = adminObject_default()

      if (photoUri) {
        const homesteadId = this.homesteadRef.id
        const storagePath = `homestead/${homesteadId}/animalGroup/${group.id}/photo.jpg`
        await storage().ref(storagePath).putFile(photoUri)
        const downloadUrl = await storage().ref(storagePath).getDownloadURL()
        group.photoStorageRef = storagePath
        group.photoUrl = downloadUrl
      }

      await ref.set(group as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createGroup error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateGroup(group: AnimalGroup, photoUri?: string): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(group.admin)

      if (photoUri) {
        const homesteadId = this.homesteadRef.id
        const storagePath = `homestead/${homesteadId}/animalGroup/${group.id}/photo.jpg`
        await storage().ref(storagePath).putFile(photoUri)
        const downloadUrl = await storage().ref(storagePath).getDownloadURL()
        group.photoStorageRef = storagePath
        group.photoUrl = downloadUrl
      }

      await this.homesteadRef.collection(Col.animalGroup).doc(group.id).update(group as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateGroup error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteGroup(groupId: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection(Col.animalGroup).doc(groupId).update({
        'admin.deleted': true,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `deleteGroup error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async createGroupCareEvent(groupId: string, event: CareEvent): Promise<IResult> {
    try {
      const ref = this.homesteadRef
        .collection(Col.animalGroup)
        .doc(groupId)
        .collection(Col.careEvent)
        .doc()
      event.id = ref.id
      event.animalId = ''
      await ref.set(event as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createGroupCareEvent error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async createGroupHealthRecord(groupId: string, record: HealthRecord, photoUri?: string): Promise<IResult> {
    try {
      const ref = this.homesteadRef
        .collection(Col.animalGroup)
        .doc(groupId)
        .collection(Col.healthRecord)
        .doc()
      record.id = ref.id
      record.animalId = ''
      record.admin = adminObject_default()

      if (photoUri) {
        const homesteadId = this.homesteadRef.id
        const storagePath = `homestead/${homesteadId}/animalGroup/${groupId}/healthRecord/${record.id}/photo.jpg`
        await storage().ref(storagePath).putFile(photoUri)
        const downloadUrl = await storage().ref(storagePath).getDownloadURL()
        record.photoStorageRef = storagePath
        record.photoUrl = downloadUrl
      }

      await ref.set(record as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createGroupHealthRecord error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async removeAnimalFromAllGroups(animalId: string): Promise<IResult> {
    try {
      const snapshot = await this.homesteadRef
        .collection(Col.animalGroup)
        .where('admin.deleted', '==', false)
        .get()

      const batch = firestore().batch()
      for (const doc of snapshot.docs) {
        const group = doc.data() as AnimalGroup
        if (group.animalIds.includes(animalId)) {
          batch.update(doc.ref, {
            animalIds: firestore.FieldValue.arrayRemove(animalId),
            'admin.updated_at': firestore.FieldValue.serverTimestamp(),
          })
        }
      }
      await batch.commit()
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `removeAnimalFromAllGroups error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }
}
