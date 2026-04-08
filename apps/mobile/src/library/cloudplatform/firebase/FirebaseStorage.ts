import ICloudPlatformStorage from "../../../core/plugin/ICloudPlatformStorage"
import storage from '@react-native-firebase/storage'
import auth from "@react-native-firebase/auth"
import uuid from 'react-native-uuid'
import { Platform } from "react-native"

export default class FirebaseStorage implements ICloudPlatformStorage {

    getUserId(): string {
        const currentUser = auth().currentUser
        if (currentUser == null) {
            throw new Error("User is not signed in")
        }
        return currentUser.uid
    }

    generateMinistryFileRef(path: string, ministryId: string): string {
        const fileext = path.split('.').pop()
        const id = uuid.v4() as string
        return "ministry/" + ministryId + "/files/" + id + "." + fileext
    }

    generatePraiseReportFileRef(path: string, ministryId: string): string {
        const fileext = path.split('.').pop()
        const id = uuid.v4() as string
        return "ministry/" + ministryId + "/praisereport/" + id + "." + fileext
    }

    async uploadMinistryFile(path: string, ministryId: string): Promise<string> {
        const docRefLink = this.generateMinistryFileRef(path, ministryId)
        const docRef = storage().ref(docRefLink)
        const uploadUri = Platform.OS === 'ios' ? path.replace('file://', '') : path
        await docRef.putFile(uploadUri)
        return docRefLink
    }

    async uploadPraiseReportFile(path: string, ministryId: string): Promise<string> {
        const docRefLink = this.generatePraiseReportFileRef(path, ministryId)
        const docRef = storage().ref(docRefLink)
        const uploadUri = Platform.OS === 'ios' ? path.replace('file://', '') : path
        await docRef.putFile(uploadUri)
        return docRefLink
    }

    async getDownloadUrl(docRef: string): Promise<string> {
        const url = await storage().ref(docRef).getDownloadURL()
        return url
    }
}
