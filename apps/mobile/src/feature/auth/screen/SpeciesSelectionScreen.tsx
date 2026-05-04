import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import { useSpeciesSelectionController } from './SpeciesSelectionController'
import PrimaryButton from '../../../components/button/PrimaryButton'
import ScreenContainer from '../../../components/layout/ScreenContainer'

const SpeciesSelectionScreen: React.FC = () => {
  const controller = useSpeciesSelectionController()

  const rows: { name: string; icon: string }[][] = []
  for (let i = 0; i < controller.availableSpecies.length; i += 2) {
    rows.push(controller.availableSpecies.slice(i, i + 2))
  }

  return (
    <ScreenContainer>
      <View className="flex-1 px-4 pt-6">
        <Text className="text-2xl font-bold text-text-primary text-center">
          What animals do you keep?
        </Text>
        <Text className="text-base text-text-secondary text-center mt-2 mb-6">
          Select all that apply — you can add more later
        </Text>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row mb-3">
              {row.map(item => {
                const isSelected = controller.selectedSpecies.includes(item.name)
                return (
                  <TouchableOpacity
                    key={item.name}
                    className={`flex-1 mx-1.5 p-4 rounded-xl items-center border-2 ${
                      isSelected ? 'border-primary bg-accent-light' : 'border-border-light bg-surface'
                    }`}
                    onPress={() => controller.toggleSpecies(item.name)}
                  >
                    <Icon
                      name={item.icon as React.ComponentProps<typeof Icon>['name']}
                      size={32}
                      color={isSelected ? '#4A6741' : '#6B6B6B'}
                    />
                    <Text className={`text-sm font-medium mt-2 ${isSelected ? 'text-primary' : 'text-text-secondary'}`}>
                      {item.name}
                    </Text>
                    {isSelected ? (
                      <View className="absolute top-2 right-2">
                        <Icon name="check-circle" size={18} color="#4A6741" />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                )
              })}
              {row.length === 1 ? <View className="flex-1 mx-1.5" /> : null}
            </View>
          ))}
        </ScrollView>

        <View className="py-4">
          <PrimaryButton
            title="Get Started"
            onPress={controller.complete}
            loading={controller.loading}
            disabled={controller.selectedSpecies.length === 0}
          />
          <TouchableOpacity className="mt-4 items-center py-2" onPress={controller.skip}>
            <Text className="text-sm text-text-secondary">I'll set this up later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  )
}

export default SpeciesSelectionScreen
