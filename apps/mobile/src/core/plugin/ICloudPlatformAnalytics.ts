import { Subscribable } from 'rxjs'

export default interface ICloudPlatformAnalytics {
  readonly appShown: Subscribable<boolean>

  logEvent(name: string, params?: Record<string, string | number>): void
  setUserId(userId: string): void
  clearUserId(): void
  setUserProperty(name: string, value: string): void
  clearUserProperties(names: string[]): void
}
