import React from 'react'
import { TouchableOpacity, Text } from 'react-native'

interface IconButtonProps {
  icon: string
  onPress: () => void
  size?: number
  disabled?: boolean
}

const IconButton: React.FC<IconButtonProps> = ({ icon, onPress, size = 24, disabled }) => {
  return (
    <TouchableOpacity
      className={`p-2 rounded-full items-center justify-center ${disabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: size }}>{icon}</Text>
    </TouchableOpacity>
  )
}

export default IconButton
