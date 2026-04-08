export default interface ICloudPlatformStorage {
    // @returns the document reference.
    uploadMinistryFile(path: string, ministryId: string): Promise<string>
    uploadPraiseReportFile(path: string, ministryId: string): Promise<string>
    getDownloadUrl(docRef: string): Promise<string>
}
