import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import { adminObject_default } from '../../../schema/object/AdminObject'
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

  async fetchNotesByAnimal(animalId: string): Promise<Note[]> {
    try {
      const snapshot = await this.homesteadRef
        .collection('note')
        .where('animalId', '==', animalId)
        .where('admin.deleted', '==', false)
        .orderBy('admin.created_at', 'desc')
        .get()

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note))
    } catch (error: any) {
      Log.error(TAG, `fetchNotesByAnimal error: ${error.message}`)
      return []
    }
  }

  async createNote(note: Note, photoUri?: string): Promise<IResult> {
    try {
      const docRef = this.homesteadRef.collection('note').doc()
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

  async deleteNote(noteId: string): Promise<IResult> {
    try {
      await this.homesteadRef.collection('note').doc(noteId).update({
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
