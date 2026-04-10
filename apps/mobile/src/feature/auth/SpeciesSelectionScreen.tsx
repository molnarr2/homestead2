import React from 'react'
import { View, Text } from 'react-native'

const SpeciesSelectionScreen: React.FC = () => {
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Text className="text-2xl font-bold text-text-primary">Select Your Species</Text>
      <Text className="text-sm text-text-secondary mt-2">Coming soon</Text>
    </View>
  )
}

export default SpeciesSelectionScreen
