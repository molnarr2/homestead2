import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import Animal from '../../../schema/animal/Animal'

interface Props {
  animals: Animal[]
  selectedAnimalId: string | null
  onSelect: (animalId: string | null) => void
}

const CareFilterBar: React.FC<Props> = ({ animals, selectedAnimalId, onSelect }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-2">
        <TouchableOpacity
          className={`px-3 py-1.5 rounded-full border ${!selectedAnimalId ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
          onPress={() => onSelect(null)}
          activeOpacity={0.7}
        >
          <Text className={`text-sm font-medium ${!selectedAnimalId ? 'text-text-inverse' : 'text-text-secondary'}`}>
            All Animals
          </Text>
        </TouchableOpacity>
        {animals.map(animal => {
          const isSelected = selectedAnimalId === animal.id
          return (
            <TouchableOpacity
              key={animal.id}
              className={`px-3 py-1.5 rounded-full border ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
              onPress={() => onSelect(animal.id)}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-medium ${isSelected ? 'text-text-inverse' : 'text-text-secondary'}`}>
                {animal.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </ScrollView>
  )
}

export default CareFilterBar
