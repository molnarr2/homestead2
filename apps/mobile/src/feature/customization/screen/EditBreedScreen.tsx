import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useEditBreedController } from './EditBreedController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditBreed'>
type Route = RouteProp<RootStackParamList, 'EditBreed'>

const EditBreedScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const controller = useEditBreedController(navigation, route)

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">
          {controller.isEditing ? 'Edit Breed' : 'New Breed'}
        </Text>
        {controller.isEditing ? (
          <TouchableOpacity onPress={controller.onDelete} activeOpacity={0.7} className="p-1">
            <Icon name="trash-can-outline" size={24} color="#E53935" />
          </TouchableOpacity>
        ) : (
          <View className="w-10" />
        )}
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TextInput
          label="Name *"
          value={controller.name}
          onChangeText={controller.setName}
          placeholder="e.g. Nubian, Rhode Island Red"
          autoCapitalize="words"
        />

        <TextInput
          label="Gestation Days Override"
          value={controller.gestationDays}
          onChangeText={controller.setGestationDays}
          placeholder="0"
          keyboardType="number-pad"
        />
        <Text className="text-xs text-text-secondary -mt-3 mb-4">
          Leave at 0 to use the species default
        </Text>

        <View className="mt-4 mb-8">
          <PrimaryButton
            title={controller.isEditing ? 'Save Changes' : 'Create Breed'}
            onPress={controller.save}
            loading={controller.loading}
            disabled={!controller.name.trim()}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

export default EditBreedScreen
