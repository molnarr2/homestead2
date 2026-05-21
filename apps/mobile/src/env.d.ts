declare module 'react-native-config' {
  export interface NativeConfig {
    PUBLIC_APPLE_API_KEY?: string
    PUBLIC_GOOGLE_API_KEY?: string
  }

  declare const Config: NativeConfig
  export default Config
}
