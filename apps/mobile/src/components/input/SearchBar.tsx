import React from 'react'
import { View, TextInput, Text } from 'react-native'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, placeholder = 'Search...' }) => {
  return (
    <View className="flex-row items-center bg-surface border border-border-light rounded-full px-4 py-2 mx-4">
      <Text className="text-base mr-2">🔍</Text>
      <TextInput
        className="flex-1 text-base text-text-primary"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#BDBDBD"
        returnKeyType="search"
      />
    </View>
  )
}

export default SearchBar
