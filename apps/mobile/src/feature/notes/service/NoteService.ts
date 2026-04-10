import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_updateLastUpdated } from '../../../schema/object/AdminObject'
import Note from '../../../schema/notes/Note'
import Log from '../../../library/log/Log'
import { useHomesteadStore } from '../../../store/homesteadStore'
import INoteService from './INoteService'

const TAG = 'NoteService'

export default class NoteService implements INoteService {

  private get homesteadRef() {
    const homesteadId = useHomesteadStore.getState().homesteadId
    return firestore().collection('homestead').doc(homesteadId)
  }

  async getNotesForAnimal(animalId: string): Promise<Note[]> {
    try {
      const snapshot = await this.homesteadRef
        .collection('note')
        .where('animalId', '==', animalId)
        .where('admin.deleted', '==', false)
        .get()

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as Note))
    } catch (error: any) {
      Log.error(TAG, `getNotesForAnimal error: ${error.message}`)
      return []
    }
  }

  async createNote(note: Note): Promise<IResult> {
    try {
      const ref = this.homesteadRef.collection('note').doc()
      note.id = ref.id
      await ref.set(note as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `createNote error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async updateNote(note: Note): Promise<IResult> {
    try {
      adminObject_updateLastUpdated(note.admin)
      await this.homesteadRef.collection('note').doc(note.id).update(note as any)
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `updateNote error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async deleteNote(id: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection('note').doc(id).update({
        'admin.deleted': true,
        'admin.updated_at': firestore.FieldValue.serverTimestamp(),
      })
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `deleteNote error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async uploadNotePhoto(noteId: string, uri: string): Promise<{ url: string, ref: string } | null> {
    try {
      const homesteadId = useHomesteadStore.getState().homesteadId
      const path = `homestead/${homesteadId}/note/${noteId}/${Date.now()}.jpg`
      const ref = storage().ref(path)
      await ref.putFile(uri)
      const url = await ref.getDownloadURL()
      return { url, ref: path }
    } catch (error: any) {
      Log.error(TAG, `uploadNotePhoto error: ${error.message}`)
      return null
    }
  }
}
