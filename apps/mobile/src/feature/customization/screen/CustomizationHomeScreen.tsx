import React from 'react'
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCustomizationHomeController } from './CustomizationHomeController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import FloatingActionButton from '../../../components/button/FloatingActionButton'
import EmptyState from '../../../components/layout/EmptyState'
import AnimalTypeCard from '../component/AnimalTypeCard'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList>

const CustomizationHomeScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const controller = useCustomizationHomeController(navigation)

  if (controller.loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A6741" />
        </View>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <View className="flex-1">
        <View className="flex-row items-center px-4 pt-4 pb-2">
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Icon name="arrow-left" size={24} color="#333333" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text-primary ml-3">Customization</Text>
        </View>

        {controller.animalTypes.length === 0 ? (
          <EmptyState
            icon="cog-outline"
            title="No animal types set up"
            subtitle="Add your first species!"
          />
        ) : (
          <FlatList
            data={controller.animalTypes}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <AnimalTypeCard
                name={item.name}
                breedCount={item.breeds?.length ?? 0}
                careTemplateCount={item.careTemplates?.length ?? 0}
                onPress={() => controller.onAnimalTypePress(item.id)}
              />
            )}
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        <FloatingActionButton onPress={controller.onCreateAnimalType} />
      </View>
    </ScreenContainer>
  )
}

export default CustomizationHomeScreen
