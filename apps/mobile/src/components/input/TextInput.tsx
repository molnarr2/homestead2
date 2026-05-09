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
  suffix?: string
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
  suffix,
}) => {
  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-sm font-medium text-text-primary mb-1">{label}</Text>
      ) : null}
      <View className={`flex-row items-center border ${error ? 'border-status-error' : 'border-border-light'} rounded-lg bg-surface`}>
        <RNTextInput
          className="flex-1 px-4 py-3 text-base text-text-primary"
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
        {suffix ? (
          <Text className="text-base text-text-secondary pr-4">{suffix}</Text>
        ) : null}
      </View>
      {error ? (
        <Text className="text-xs text-status-error mt-1">{error}</Text>
      ) : null}
    </View>
  )
}

export default TextInput
