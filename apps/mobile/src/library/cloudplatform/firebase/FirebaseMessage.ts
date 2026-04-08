import messaging from '@react-native-firebase/messaging'
import ICloudPlatformMessage from '../../../core/plugin/ICloudPlatformMessage'
import Log from '../../log/Log.ts'

export default class FirebaseMessage implements ICloudPlatformMessage {
    async requestPermission(): Promise<boolean> {
        try {
            const authStatus = await messaging().requestPermission()
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL
            Log.info("FirebaseMessage", "Notification permission status: " + authStatus)
            return enabled
        } catch (ex) {
            Log.error("FirebaseMessage", "Error requesting notification permission: " + ex)
            return false
        }
    }

    async getToken(): Promise<string> {
        try {
            if (!messaging().isDeviceRegisteredForRemoteMessages) {
                await messaging().registerDeviceForRemoteMessages()
            }
        } catch(ex) {
            Log.debug("FirebaseMessage", "Already registered for remote messages.")
        }
        const fcmToken = await messaging().getToken()
        return fcmToken
    }

    onNotificationOpenedApp(onOpenedApp: (data?: { [key: string]: string | object }) => void) {
        messaging().onNotificationOpenedApp((message) => {
            Log.info("FirebaseMessage", "Notification: " + JSON.stringify(message))
            onOpenedApp(message.data)
        })
    }

    onTokenRefresh(callback: (token: string) => void) {
        messaging().onTokenRefresh((token) => {
            Log.info("FirebaseMessage", "FCM token refreshed")
            callback(token)
        })
    }

    async getInitialNotification(): Promise<{ [key: string]: string | object } | null> {
        const remoteMessage = await messaging().getInitialNotification()
        if (remoteMessage?.data) {
            Log.info("FirebaseMessage", "Initial notification: " + JSON.stringify(remoteMessage))
            return remoteMessage.data
        }
        return null
    }
}

