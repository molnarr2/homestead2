declare module 'react-native-config' {
  export interface NativeConfig {
    PUBLIC_APPLE_API_KEY?: string
    PUBLIC_GOOGLE_API_KEY?: string
  }

  declare const Config: NativeConfig
  export default Config
}

declare module 'react-native-html-to-pdf' {
  interface Options {
    html: string
    fileName?: string
    directory?: string
    base64?: boolean
    height?: number
    width?: number
    padding?: number
  }

  interface Result {
    filePath: string
    base64?: string
  }

  const RNHTMLtoPDF: {
    convert(options: Options): Promise<Result>
  }

  export default RNHTMLtoPDF
}
