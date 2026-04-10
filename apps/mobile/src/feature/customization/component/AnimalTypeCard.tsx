import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'

interface Props {
  name: string
  breedCount: number
  careTemplateCount: number
  onPress: () => void
}

const AnimalTypeCard: React.FC<Props> = ({ name, breedCount, careTemplateCount, onPress }) => {
  return (
    <TouchableOpacity
      className="mx-4 mb-2 bg-surface rounded-xl p-4 flex-row items-center border border-border-light"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 rounded-full bg-primaryLight items-center justify-center mr-3">
        <Text className="text-lg font-bold text-primary">{name.charAt(0)}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-text-primary">{name}</Text>
        <Text className="text-sm text-text-secondary">
          {breedCount} breed{breedCount !== 1 ? 's' : ''} · {careTemplateCount} care template{careTemplateCount !== 1 ? 's' : ''}
        </Text>
      </View>
      <Icon name="chevron-right" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  )
}

export default AnimalTypeCard
