import React from 'react'
import { TouchableOpacity, Text } from 'react-native'

interface FloatingActionButtonProps {
  onPress: () => void
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text className="text-2xl text-text-inverse font-light">+</Text>
    </TouchableOpacity>
  )
}

export default FloatingActionButton
