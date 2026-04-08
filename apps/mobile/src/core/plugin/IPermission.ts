export enum PermissionResults {
	SUCCESS,
	FAILED,
	// FAILED_CAN_ASK_AGAIN,
}

export default interface IPermission {
	checkAndRequestLocation(): Promise<PermissionResults>
	checkAndRequestCamera(): Promise<PermissionResults>
	checkAndRequestPhotoLibrary(): Promise<PermissionResults>
}
