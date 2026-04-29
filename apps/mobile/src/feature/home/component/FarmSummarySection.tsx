import React from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import SectionHeader from '../../../components/layout/SectionHeader'
import { FarmSummaryItem } from '../HomeController'

interface Props {
  items: FarmSummaryItem[]
  onAnimalTypePress: () => void
  onAddAnimal: () => void
}

const FarmSummarySection: React.FC<Props> = ({ items, onAnimalTypePress, onAddAnimal }) => {
  return (
    <View>
      <SectionHeader title="Farm Summary" />
      {items.length === 0 ? (
        <Pressable
          className="bg-surface rounded-xl p-4 flex-row items-center"
          onPress={onAddAnimal}
        >
          <Icon name="plus-circle-outline" size={24} color="#4A6741" />
          <Text className="ml-2 text-sm font-medium text-primary">Add your first animal</Text>
        </Pressable>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {items.map(item => (
              <Pressable
                key={item.animalType}
                className="bg-surface rounded-xl px-4 py-3 items-center min-w-[80px]"
                onPress={onAnimalTypePress}
              >
                <Text className="text-lg font-bold text-text-primary">{item.count}</Text>
                <Text className="text-xs text-text-secondary mt-0.5">{item.animalType}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  )
}

export default FarmSummarySection
