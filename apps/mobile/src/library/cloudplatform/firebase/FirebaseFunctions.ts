import ICloudPlatformFunctions from '../../../core/plugin/ICloudPlatformFunctions'
import functions from '@react-native-firebase/functions'
import auth from '@react-native-firebase/auth'
import Person from '../../../schema/ministry/Person'
import Log from '../../log/Log.ts'

export default class FirebaseFunctions implements ICloudPlatformFunctions {
  useEmulator(): void {
    functions().useEmulator('localhost', 5001)
  }

  async createMinistryAndAdminRole(): Promise<string> {
    const currentUser = auth().currentUser
    if (currentUser === null) {
      throw new Error('User is not logged in.')
    }

    try {
      const result = await functions().httpsCallable('createMinistryAndAdminRole')({
        auth: {
          uid: currentUser.uid
        }
      })

      return (result.data as { ministryId?: string })?.ministryId || ''
    } catch (error: any) {
      Log.error('FirebaseFunctions', 'Error calling createMinistryAndAdminRole: ' + error)
      return ''
    }
  }

  async getPersons(lastUpdatedEpochSeconds: number): Promise<Person[]> {
    const currentUser = auth().currentUser
    if (currentUser === null) {
      throw new Error('User is not logged in.')
    }

    try {
      const result = await functions().httpsCallable('getPersons')({
        auth: {
          uid: currentUser.uid
        },
        lastUpdatedEpochSeconds: lastUpdatedEpochSeconds
      })

      return (result.data as { persons?: Person[] })?.persons || []
    } catch (error: any) {
      Log.error('FirebaseFunctions', 'Error calling getPersons: ' + error)
      return []
    }
  }

  async incrementPraiseGodCount(ministryId: string, praiseReportId: string): Promise<void> {
    const currentUser = auth().currentUser
    if (currentUser === null) {
      throw new Error('User is not logged in.')
    }

    try {
      await functions().httpsCallable('incrementPraiseGodCount')({
        auth: {
          uid: currentUser.uid
        },
        ministryId: ministryId,
        praiseReportId: praiseReportId
      })
    } catch (error: any) {
      Log.error('FirebaseFunctions', 'Error calling incrementPraiseGodCount: ' + error)
      throw error
    }
  }

  async approveRequestToJoin(ministryId: string, requestId: string): Promise<void> {
    const currentUser = auth().currentUser
    if (currentUser === null) {
      throw new Error('User is not logged in.')
    }

    try {
      await functions().httpsCallable('approveRequestToJoin')({
        auth: {
          uid: currentUser.uid
        },
          ministry_id: ministryId,
          request_to_join_id: requestId
      })
    } catch (error: any) {
      Log.error('FirebaseFunctions', 'Error calling approveRequestToJoin: ' + error)
      throw error
    }
  }
}
