import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'

const LoadingScreen: React.FC = () => {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-3xl font-bold text-primary mb-4">Homestead</Text>
      <ActivityIndicator size="large" color="#4A6741" />
    </View>
  )
}

export default LoadingScreen
