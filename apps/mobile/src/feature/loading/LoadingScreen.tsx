import React from 'react'
import { View, ActivityIndicator } from 'react-native'

const LoadingScreen: React.FC = () => {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#4A6741" />
    </View>
  )
}

export default LoadingScreen
