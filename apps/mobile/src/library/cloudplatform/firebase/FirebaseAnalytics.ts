import analytics from '@react-native-firebase/analytics'
import { AppState } from 'react-native'
import { BehaviorSubject, Subscribable } from 'rxjs'
import ICloudPlatformAnalytics from "../../../core/plugin/ICloudPlatformAnalytics"

export default class FirebaseAnalytics implements ICloudPlatformAnalytics {
    private appShownSubject: BehaviorSubject<boolean>
    appShown: Subscribable<boolean>

    constructor() {
        this.appShownSubject = new BehaviorSubject<boolean>(true)
        this.appShown = this.appShownSubject

        AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                this.appShownSubject.next(true)
            }
        })
    }

    logEvent(name: string, params?: { [key: string]: string | number }): void {
        analytics().logEvent(name, params).then(() => {})
    }

    setUserId(userId: string): void {
        analytics().setUserId(userId).then(() => {})
    }

    clearUserId(): void {
        analytics().setUserId(null as unknown as string).then(() => {})
    }

    setUserProperty(name: string, value: string): void {
        analytics().setUserProperty(name, value).then(() => {})
    }

    clearUserProperties(propertyNames: string[]): void {
        for (const name of propertyNames) {
            analytics().setUserProperty(name, null as unknown as string).then(() => {})
        }
    }
}
