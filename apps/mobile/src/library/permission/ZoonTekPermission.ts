import { check, PERMISSIONS, request, requestLocationAccuracy, RESULTS } from "react-native-permissions";
import { Platform } from "react-native";
import IPermission, {PermissionResults} from "../../core/plugin/IPermission.ts";

export default class ZoonTekPermissions implements IPermission {
	async checkAndRequestLocation(): Promise<PermissionResults> {
		if (Platform.OS === 'android') {
			return this.checkAndRequestLocationAndroid()
		} else {
			return this.checkAndRequestLocationIOS()
		}
	}

	async checkAndRequestCamera(): Promise<PermissionResults> {
		if (Platform.OS === 'android') {
			return this.checkAndRequestCameraAndroid()
		} else {
			return this.checkAndRequestCameraIOS()
		}
	}

	async checkAndRequestPhotoLibrary(): Promise<PermissionResults> {
		if (Platform.OS === 'android') {
			return this.checkAndRequestPhotoLibraryAndroid()
		} else {
			return this.checkAndRequestPhotoLibraryIOS()
		}
	}
	async checkAndRequestLocationAndroid(): Promise<PermissionResults> {
		const checkResultFine = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
		const checkResultCoarse = await check(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION)
		if (checkResultFine == RESULTS.GRANTED || checkResultFine == RESULTS.LIMITED ||
			checkResultCoarse == RESULTS.GRANTED || checkResultCoarse == RESULTS.LIMITED) {
			return PermissionResults.SUCCESS
		} else if (checkResultCoarse != RESULTS.DENIED) {
			return PermissionResults.FAILED
		}

		const resultFine = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
		if (resultFine == "granted" || resultFine == "limited") {
			return PermissionResults.SUCCESS
		}

		const resultCoarse = await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION)
		if (resultCoarse == "granted" || resultCoarse == "limited") {
			return PermissionResults.SUCCESS
		}

		return PermissionResults.FAILED
	}

	async checkAndRequestLocationIOS(): Promise<PermissionResults> {
		const checkResult = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
		if (checkResult == RESULTS.GRANTED || checkResult == RESULTS.LIMITED) {
			return PermissionResults.SUCCESS
		} else if (checkResult != RESULTS.DENIED) {
			return PermissionResults.FAILED
		}

		const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
		if (result != "granted") {
			return PermissionResults.FAILED
		}

		const resultLocation = await requestLocationAccuracy({
			purposeKey: "drop-apples-need-location"
		})
		if (resultLocation == "full" || resultLocation == "reduced") {
			return PermissionResults.SUCCESS
		}
		return PermissionResults.FAILED
	}

	async checkAndRequestCameraAndroid(): Promise<PermissionResults> {
		const checkResult = await check(PERMISSIONS.ANDROID.CAMERA)
		if (checkResult == RESULTS.GRANTED || checkResult == RESULTS.LIMITED) {
			return PermissionResults.SUCCESS
		} else if (checkResult == RESULTS.BLOCKED || checkResult == RESULTS.UNAVAILABLE) {
			return PermissionResults.FAILED
		}

		// DENIED means we can ask for permission
		const result = await request(PERMISSIONS.ANDROID.CAMERA)
		if (result == "granted" || result == "limited") {
			return PermissionResults.SUCCESS
		}

		return PermissionResults.FAILED
	}

	async checkAndRequestCameraIOS(): Promise<PermissionResults> {
		const checkResult = await check(PERMISSIONS.IOS.CAMERA)
		if (checkResult == RESULTS.GRANTED || checkResult == RESULTS.LIMITED) {
			return PermissionResults.SUCCESS
		} else if (checkResult == RESULTS.BLOCKED || checkResult == RESULTS.UNAVAILABLE) {
			return PermissionResults.FAILED
		}

		// DENIED means we can ask for permission
		const result = await request(PERMISSIONS.IOS.CAMERA)
		if (result == "granted" || result == "limited") {
			return PermissionResults.SUCCESS
		}

		return PermissionResults.FAILED
	}

	async checkAndRequestPhotoLibraryAndroid(): Promise<PermissionResults> {
		// For Android 13+ (API 33+), use READ_MEDIA_IMAGES
		// For older versions, use READ_EXTERNAL_STORAGE
		const checkResultMedia = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)
		if (checkResultMedia == RESULTS.GRANTED || checkResultMedia == RESULTS.LIMITED) {
			return PermissionResults.SUCCESS
		}

		// Try READ_EXTERNAL_STORAGE for older Android versions
		const checkResultStorage = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
		if (checkResultStorage == RESULTS.GRANTED || checkResultStorage == RESULTS.LIMITED) {
			return PermissionResults.SUCCESS
		}

		// Check if we can request (not blocked)
		const canRequestMedia = checkResultMedia != RESULTS.BLOCKED && checkResultMedia != RESULTS.UNAVAILABLE
		const canRequestStorage = checkResultStorage != RESULTS.BLOCKED && checkResultStorage != RESULTS.UNAVAILABLE

		// If both are blocked, return failed
		if (!canRequestMedia && !canRequestStorage) {
			return PermissionResults.FAILED
		}

		// Try to request READ_MEDIA_IMAGES first (for Android 13+)
		if (canRequestMedia) {
			const resultMedia = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)
			if (resultMedia == "granted" || resultMedia == "limited") {
				return PermissionResults.SUCCESS
			}
		}

		// Fall back to READ_EXTERNAL_STORAGE for older Android
		if (canRequestStorage) {
			const resultStorage = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
			if (resultStorage == "granted" || resultStorage == "limited") {
				return PermissionResults.SUCCESS
			}
		}

		return PermissionResults.FAILED
	}

	async checkAndRequestPhotoLibraryIOS(): Promise<PermissionResults> {
		const checkResult = await check(PERMISSIONS.IOS.PHOTO_LIBRARY)
		if (checkResult == RESULTS.GRANTED || checkResult == RESULTS.LIMITED) {
			return PermissionResults.SUCCESS
		} else if (checkResult == RESULTS.BLOCKED || checkResult == RESULTS.UNAVAILABLE) {
			return PermissionResults.FAILED
		}

		// DENIED means we can ask for permission
		const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY)
		if (result == "granted" || result == "limited") {
			return PermissionResults.SUCCESS
		}

		return PermissionResults.FAILED
	}
}
