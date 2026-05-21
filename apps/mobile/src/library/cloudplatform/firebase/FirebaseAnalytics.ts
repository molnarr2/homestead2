import analytics from '@react-native-firebase/analytics'
import { AppState } from 'react-native'
import { BehaviorSubject, Subscribable } from 'rxjs'
import ICloudPlatformAnalytics from '../../../core/plugin/ICloudPlatformAnalytics'

export default class FirebaseAnalytics implements ICloudPlatformAnalytics {
  private appShownSubject = new BehaviorSubject<boolean>(false)
  readonly appShown: Subscribable<boolean> = this.appShownSubject

  constructor() {
    AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        this.appShownSubject.next(true)
      }
    })
  }

  logEvent(name: string, params?: Record<string, string | number>): void {
    analytics().logEvent(name, params)
  }

  setUserId(userId: string): void {
    analytics().setUserId(userId)
  }

  clearUserId(): void {
    analytics().setUserId(null)
  }

  setUserProperty(name: string, value: string): void {
    analytics().setUserProperty(name, value)
  }

  clearUserProperties(names: string[]): void {
    for (const name of names) {
      analytics().setUserProperty(name, null)
    }
  }
}
