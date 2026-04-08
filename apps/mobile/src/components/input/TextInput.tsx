import React from 'react'
import { View, Text, TextInput as RNTextInput, TextInputProps as RNTextInputProps } from 'react-native'

interface TextInputProps {
  label?: string
  value: string
  onChangeText: (text: string) => void
  error?: string
  secureTextEntry?: boolean
  placeholder?: string
  multiline?: boolean
  numberOfLines?: number
  keyboardType?: RNTextInputProps['keyboardType']
  autoCapitalize?: RNTextInputProps['autoCapitalize']
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry,
  placeholder,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize,
}) => {
  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-sm font-medium text-text-primary mb-1">{label}</Text>
      ) : null}
      <RNTextInput
        className={`border ${error ? 'border-status-error' : 'border-border-light'} rounded-lg px-4 py-3 text-base text-text-primary bg-surface`}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor="#BDBDBD"
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {error ? (
        <Text className="text-xs text-status-error mt-1">{error}</Text>
      ) : null}
    </View>
  )
}

export default TextInput
