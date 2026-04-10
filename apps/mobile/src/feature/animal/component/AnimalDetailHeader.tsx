import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import Animal from '../../../schema/animal/Animal'
import { AnimalAge } from '../../../util/AnimalUtility'

interface Props {
  animal: Animal
  age: AnimalAge
  onEdit: () => void
  onBack: () => void
}

const STATE_BADGE_COLORS: Record<string, string> = {
  own: 'bg-status-success',
  sold: 'bg-status-info',
  died: 'bg-status-error',
  processed: 'bg-status-warning',
}

const AnimalDetailHeader: React.FC<Props> = ({ animal, age, onEdit, onBack }) => {
  return (
    <View className="bg-surface pb-4 border-b border-border-light">
      <View className="flex-row items-center justify-between px-4 pt-4 mb-3">
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onEdit} activeOpacity={0.7} className="p-1">
          <Icon name="pencil" size={24} color="#4A6741" />
        </TouchableOpacity>
      </View>

      <View className="items-center px-4">
        <View className="w-24 h-24 rounded-full bg-backgroundDark items-center justify-center mb-3 overflow-hidden">
          {animal.photoUrl ? (
            <View className="w-24 h-24 rounded-full bg-primaryLight items-center justify-center">
              <Text className="text-3xl font-bold text-text-inverse">{animal.name.charAt(0)}</Text>
            </View>
          ) : (
            <Text className="text-3xl font-bold text-text-secondary">{animal.name.charAt(0)}</Text>
          )}
        </View>

        <Text className="text-2xl font-bold text-text-primary">{animal.name}</Text>

        <View className="flex-row items-center mt-1">
          {animal.breed ? (
            <Text className="text-base text-text-secondary">{animal.breed}</Text>
          ) : null}
          {animal.breed && age.display ? (
            <Text className="text-base text-text-secondary"> · </Text>
          ) : null}
          {age.display ? (
            <Text className="text-base text-text-secondary">{age.display}</Text>
          ) : null}
        </View>

        <View className="flex-row items-center mt-2 gap-2">
          <View className={`px-3 py-1 rounded-full ${STATE_BADGE_COLORS[animal.state] || 'bg-primary'}`}>
            <Text className="text-xs font-bold text-text-inverse capitalize">{animal.state}</Text>
          </View>
          {animal.gender !== 'unknown' ? (
            <View className="px-3 py-1 rounded-full bg-backgroundDark">
              <Text className="text-xs font-bold text-text-primary capitalize">{animal.gender}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  )
}

export default AnimalDetailHeader
