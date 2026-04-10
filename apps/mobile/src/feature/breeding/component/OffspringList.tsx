import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import type Animal from '../../../schema/animal/Animal'
import Icon from '@react-native-vector-icons/material-design-icons'

interface Props {
  offspring: Animal[]
  onAnimalPress: (animalId: string) => void
}

const OffspringList: React.FC<Props> = ({ offspring, onAnimalPress }) => {
  if (offspring.length === 0) return null

  return (
    <View className="mt-4">
      <Text className="text-base font-bold text-text-primary mb-2">Offspring</Text>
      {offspring.map(animal => (
        <TouchableOpacity
          key={animal.id}
          className="flex-row items-center bg-surface rounded-lg p-3 border border-border-light mb-2"
          onPress={() => onAnimalPress(animal.id)}
          activeOpacity={0.7}
        >
          <View className="bg-primary/10 rounded-full p-2 mr-3">
            <Icon name="paw" size={18} color="#4A6741" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-text-primary">{animal.name}</Text>
            <Text className="text-sm text-text-secondary">
              {animal.breed || animal.animalType} &middot; {animal.gender}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color="#9E9E9E" />
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default OffspringList
