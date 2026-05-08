import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_default, adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import Note from '../../../schema/notes/Note'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import INoteService from './INoteService'
import { Col } from '@template/common'

const TAG = 'NoteService'

export default class NoteService implements INoteService {

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection(Col.homestead).doc(homesteadId)
  }

  subscribeNotes(callback: (notes: Note[]) => void): () => void {
    return this.homesteadRef
      .collection(Col.note)
      .where('admin.deleted', '==', false)
      .onSnapshot(
        snapshot => {
          const notes: Note[] = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          } as Note))
          callback(notes)
        },
        error => {
          Log.error(TAG, `subscribeNotes error: ${error.message}`)
          callback([])
        }
      )
  }

  async createNote(note: Note, photoUri?: string): Promise<IResult> {
    try {
      const docRef = this.homesteadRef.collection(Col.note).doc()
      const noteData: Note = {
        ...note,
        id: docRef.id,
        admin: adminObject_default(),
      }

      if (photoUri) {
        const homesteadId = useHomesteadStore.getState().homesteadId
        const storagePath = `homestead/${homesteadId}/note/${docRef.id}/photo.jpg`
        await storage().ref(storagePath).putFile(photoUri)
        const downloadUrl = await storage().ref(storagePath).getDownloadURL()
        noteData.photoStorageRef = storagePath
        noteData.photoUrl = downloadUrl
      }

      await docRef.set(noteData as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createNote error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateNote(note: Note, photoUri?: string): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(note.admin)

      if (photoUri) {
        const homesteadId = useHomesteadStore.getState().homesteadId
        const storagePath = `homestead/${homesteadId}/note/${note.id}/photo.jpg`
        await storage().ref(storagePath).putFile(photoUri)
        const downloadUrl = await storage().ref(storagePath).getDownloadURL()
        note.photoStorageRef = storagePath
        note.photoUrl = downloadUrl
      }

      await this.homesteadRef.collection(Col.note).doc(note.id).update(note as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateNote error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteNote(noteId: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection(Col.note).doc(noteId).update({
        'admin.deleted': true,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `deleteNote error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }
}
