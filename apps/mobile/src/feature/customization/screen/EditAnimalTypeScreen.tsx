import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useEditAnimalTypeController } from './EditAnimalTypeController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditAnimalType'>
type Route = RouteProp<RootStackParamList, 'EditAnimalType'>

const EditAnimalTypeScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const controller = useEditAnimalTypeController(navigation, route)

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">
          {controller.isEditing ? 'Edit Animal Type' : 'New Animal Type'}
        </Text>
        {controller.isEditing ? (
          <TouchableOpacity onPress={controller.onDelete} activeOpacity={0.7} className="p-1">
            <Icon name="trash-can-outline" size={24} color="#E53935" />
          </TouchableOpacity>
        ) : (
          <View className="w-10" />
        )}
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TextInput
          label="Name *"
          value={controller.name}
          onChangeText={controller.setName}
          placeholder="e.g. Chicken, Goat, Cattle"
          autoCapitalize="words"
        />

        <Text className="text-sm font-medium text-text-primary mb-2">Colors</Text>
        <View className="flex-row flex-wrap gap-2 mb-3">
          {controller.colors.map(color => (
            <TouchableOpacity
              key={color}
              className="flex-row items-center px-3 py-1.5 rounded-full bg-primaryLight border border-border-light"
              onPress={() => controller.removeColor(color)}
              activeOpacity={0.7}
            >
              <Text className="text-sm text-text-primary mr-1">{color}</Text>
              <Icon name="close" size={14} color="#6B6B6B" />
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row items-end gap-2 mb-6">
          <View className="flex-1">
            <TextInput
              value={controller.newColor}
              onChangeText={controller.setNewColor}
              placeholder="Add a color..."
              autoCapitalize="words"
            />
          </View>
          <TouchableOpacity
            className="bg-primary px-4 py-3 rounded-lg mb-4"
            onPress={controller.addColor}
            activeOpacity={0.7}
          >
            <Text className="text-sm font-semibold text-text-inverse">Add</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-4 mb-8">
          <PrimaryButton
            title={controller.isEditing ? 'Save Changes' : 'Create Animal Type'}
            onPress={controller.save}
            loading={controller.loading}
            disabled={!controller.name.trim()}
          />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}

export default EditAnimalTypeScreen
