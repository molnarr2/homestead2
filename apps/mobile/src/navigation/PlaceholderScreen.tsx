import React from 'react'
import { View, Text } from 'react-native'
import { useRoute } from '@react-navigation/native'

const PlaceholderScreen: React.FC = () => {
  const route = useRoute()
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-xl font-bold text-text-primary">{route.name}</Text>
      <Text className="text-sm text-text-secondary mt-2">Coming soon</Text>
    </View>
  )
}

export default PlaceholderScreen
