import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native'

interface SecondaryButtonProps {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ title, onPress, loading, disabled }) => {
  const isDisabled = disabled || loading
  return (
    <TouchableOpacity
      className={`border border-primary rounded-xl py-3 items-center ${isDisabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#4A6741" />
      ) : (
        <Text className="text-base font-semibold text-primary">{title}</Text>
      )}
    </TouchableOpacity>
  )
}

export default SecondaryButton
