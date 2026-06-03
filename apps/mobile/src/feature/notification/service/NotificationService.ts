import messaging from '@react-native-firebase/messaging'
import firestore from '@react-native-firebase/firestore'
import { Platform } from 'react-native'
import type { MMKV } from 'react-native-mmkv'
import { IResult, SuccessResult, ErrorResult } from '../../../util/Result'
import Device, { device_default } from '../../../schema/device/Device'
import Log from '../../../library/log/Log'
import INotificationService from './INotificationService'
import { Col } from '@template/common'

const TAG = 'NotificationService'
const NOTIFICATIONS_ENABLED_KEY = 'settings-notifications-enabled'

export default class NotificationService implements INotificationService {
  private settingsStorage: MMKV
  private currentToken: string | null = null
  private refreshUnsubscribe: (() => void) | null = null

  constructor(settingsStorage: MMKV) {
    this.settingsStorage = settingsStorage
  }

  private deviceCollection(userId: string) {
    return firestore().collection(Col.user).doc(userId).collection(Col.device)
  }

  private get notificationsEnabled(): boolean {
    return this.settingsStorage.getBoolean(NOTIFICATIONS_ENABLED_KEY) ?? true
  }

  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission()
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      )
    } catch (error: any) {
      Log.error(TAG, `requestPermission error: ${error.message}`)
      return false
    }
  }

  async registerDevice(userId: string): Promise<IResult> {
    try {
      if (!this.notificationsEnabled) return SuccessResult

      const granted = await this.requestPermission()
      if (!granted) return SuccessResult

      const token = await messaging().getToken()
      if (!token) return SuccessResult

      await this.writeToken(userId, token)
      this.currentToken = token
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `registerDevice error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  async unregisterDevice(userId: string): Promise<IResult> {
    try {
      const token = this.currentToken ?? (await messaging().getToken().catch(() => null))
      if (token) {
        await this.deviceCollection(userId).doc(token).delete()
      }
      this.currentToken = null
      return SuccessResult
    } catch (error: any) {
      Log.error(TAG, `unregisterDevice error: ${error.message}`)
      return ErrorResult(error.message)
    }
  }

  startTokenRefreshListener(userId: string): void {
    if (this.refreshUnsubscribe) return
    this.refreshUnsubscribe = messaging().onTokenRefresh(async (token: string) => {
      try {
        const oldToken = this.currentToken
        await this.writeToken(userId, token)
        this.currentToken = token
        if (oldToken && oldToken !== token) {
          await this.deviceCollection(userId).doc(oldToken).delete()
        }
      } catch (error: any) {
        Log.error(TAG, `onTokenRefresh error: ${error.message}`)
      }
    })
  }

  private async writeToken(userId: string, token: string): Promise<void> {
    const device: Device = {
      ...device_default(),
      id: token,
      userId,
      tokenId: token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    }
    await this.deviceCollection(userId).doc(token).set(device as any, { merge: true })
  }
}
