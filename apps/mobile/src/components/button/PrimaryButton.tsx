import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native'

interface PrimaryButtonProps {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress, loading, disabled }) => {
  const isDisabled = disabled || loading
  return (
    <TouchableOpacity
      className={`bg-primary rounded-xl py-3 items-center ${isDisabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="text-base font-semibold text-text-inverse">{title}</Text>
      )}
    </TouchableOpacity>
  )
}

export default PrimaryButton
