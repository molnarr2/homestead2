export default interface ICloudPlatformMessage {
    // Request notification permissions from the user. Returns true if granted.
    requestPermission(): Promise<boolean>
    // Get the token associated with the current device to be used to identify user's devices to send push notifications.
    getToken(): Promise<string>
    // Notification was tapped on that opened the app.
    onNotificationOpenedApp(onOpenedApp: (data?: { [key: string]: string | object }) => void): void
    // Listen for FCM token refresh events.
    onTokenRefresh(callback: (token: string) => void): void
    // Get the notification that launched the app from a killed state, or null if not launched by a notification.
    getInitialNotification(): Promise<{ [key: string]: string | object } | null>
}
