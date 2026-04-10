import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import Breed from '../../../schema/animalType/Breed'
import SectionHeader from '../../../components/layout/SectionHeader'

interface Props {
  breeds: Breed[]
  onAdd: () => void
  onEdit: (breedId: string) => void
}

const BreedList: React.FC<Props> = ({ breeds, onAdd, onEdit }) => {
  return (
    <View>
      <View className="flex-row items-center justify-between">
        <SectionHeader title="Breeds" count={breeds.length} />
        <TouchableOpacity onPress={onAdd} activeOpacity={0.7} className="p-2">
          <Icon name="plus" size={22} color="#4A6741" />
        </TouchableOpacity>
      </View>
      {breeds.map(breed => (
        <TouchableOpacity
          key={breed.id}
          className="bg-surface rounded-lg p-3 mb-2 flex-row items-center border border-border-light"
          onPress={() => onEdit(breed.id)}
          activeOpacity={0.7}
        >
          <View className="flex-1">
            <Text className="text-base text-text-primary">{breed.name}</Text>
            {breed.gestationDays > 0 && (
              <Text className="text-sm text-text-secondary">{breed.gestationDays} day gestation</Text>
            )}
          </View>
          <Icon name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default BreedList
