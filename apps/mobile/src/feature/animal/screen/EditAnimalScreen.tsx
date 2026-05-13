import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import TurboImage from 'react-native-turbo-image'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useEditAnimalController } from './EditAnimalController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import DatePickerInput from '../../../components/input/DatePickerInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import ParentSelector from '../component/ParentSelector'
import Icon from '@react-native-vector-icons/material-design-icons'
import { AnimalGender, AnimalState } from '../../../schema/animal/Animal'
import { launchImageLibrary, launchCamera } from 'react-native-image-picker'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditAnimal'>
type Route = RouteProp<RootStackParamList, 'EditAnimal'>

const GENDERS: { label: string; value: AnimalGender }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Unknown', value: 'unknown' },
]

const STATES: { label: string; value: AnimalState }[] = [
  { label: 'Owned', value: 'own' },
  { label: 'Sold', value: 'sold' },
  { label: 'Deceased', value: 'deceased' },
  { label: 'Processed', value: 'processed' },
]

const EditAnimalScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const controller = useEditAnimalController(navigation, route)

  const handlePhotoPick = () => {
    Alert.alert('Add Photo', 'Choose a source', [
      {
        text: 'Camera',
        onPress: async () => {
          const result = await launchCamera({ mediaType: 'photo', quality: 0.8 })
          if (result.assets?.[0]?.uri) {
            controller.setPhotoUri(result.assets[0].uri)
          }
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 })
          if (result.assets?.[0]?.uri) {
            controller.setPhotoUri(result.assets[0].uri)
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  if (!controller.animal) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-text-secondary">Animal not found</Text>
        </View>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Edit Animal</Text>
        <TouchableOpacity onPress={controller.onDelete} activeOpacity={0.7} className="p-1">
          <Icon name="trash-can-outline" size={24} color="#E53935" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          className="self-center mt-4 mb-6 w-24 h-24 rounded-full bg-backgroundDark items-center justify-center overflow-hidden border-2 border-border-light"
          onPress={handlePhotoPick}
          activeOpacity={0.7}
        >
          {controller.photoUri || controller.animal.photoUrl ? (
            <TurboImage
              source={{ uri: controller.photoUri || controller.animal.photoUrl }}
              style={{ width: 96, height: 96, borderRadius: 48 }}
              cachePolicy="dataCache"
            />
          ) : (
            <View className="items-center">
              <Icon name="camera-plus" size={28} color="#6B6B6B" />
              <Text className="text-xs text-text-secondary mt-1">Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          label="Name *"
          value={controller.name}
          onChangeText={controller.setName}
          placeholder="Enter animal name"
          autoCapitalize="words"
        />

        <Text className="text-sm font-medium text-text-primary mb-1">Animal Type *</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {controller.animalTypes.map(type => {
            const isSelected = controller.animalTypeId === type.id
            return (
              <TouchableOpacity
                key={type.id}
                className={`px-4 py-2 rounded-lg border ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
                onPress={() => controller.onSelectAnimalType(type.id)}
                activeOpacity={0.7}
              >
                <Text className={`text-sm font-medium ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {controller.availableBreeds.length > 0 ? (
          <>
            <Text className="text-sm font-medium text-text-primary mb-1">Breed</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {controller.availableBreeds.map(breed => {
                const isSelected = controller.breedId === breed.id
                return (
                  <TouchableOpacity
                    key={breed.id}
                    className={`px-3 py-1.5 rounded-full border ${isSelected ? 'bg-secondary border-secondary' : 'bg-surface border-border-light'}`}
                    onPress={() => controller.setBreedId(isSelected ? '' : breed.id)}
                    activeOpacity={0.7}
                  >
                    <Text className={`text-sm ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>
                      {breed.name}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </>
        ) : null}

        <DatePickerInput
          label="Birthday"
          value={controller.birthday}
          onChange={controller.setBirthday}
        />

        <Text className="text-sm font-medium text-text-primary mb-1">Gender</Text>
        <View className="flex-row gap-2 mb-4">
          {GENDERS.map(g => {
            const isSelected = controller.gender === g.value
            return (
              <TouchableOpacity
                key={g.value}
                className={`flex-1 py-2 rounded-lg border items-center ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
                onPress={() => controller.setGender(g.value)}
                activeOpacity={0.7}
              >
                <Text className={`text-sm font-medium ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text className="text-sm font-medium text-text-primary mb-1">Status</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {STATES.map(s => {
            const isSelected = controller.state === s.value
            return (
              <TouchableOpacity
                key={s.value}
                className={`px-4 py-2 rounded-lg border ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
                onPress={() => controller.setState(s.value)}
                activeOpacity={0.7}
              >
                <Text className={`text-sm font-medium ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <TextInput
          label="Color"
          value={controller.color}
          onChangeText={controller.setColor}
          placeholder="e.g. Black, White, Brown"
          autoCapitalize="words"
        />

        <TextInput
          label="Tag / Register Number"
          value={controller.register}
          onChangeText={controller.setRegister}
          placeholder="Optional"
        />

        {controller.animalTypeId ? (
          <>
            <ParentSelector
              label="Sire (Father)"
              animalTypeId={controller.animalTypeId}
              gender="male"
              selectedId={controller.sireId}
              onSelect={controller.setSireId}
              excludeId={controller.animal?.id}
              onNavigateToAnimal={(id) => navigation.push('AnimalDetail', { animalId: id })}
            />

            <ParentSelector
              label="Dam (Mother)"
              animalTypeId={controller.animalTypeId}
              gender="female"
              selectedId={controller.damId}
              onSelect={controller.setDamId}
              excludeId={controller.animal?.id}
              onNavigateToAnimal={(id) => navigation.push('AnimalDetail', { animalId: id })}
            />
          </>
        ) : null}

        <View className="mt-4 mb-8">
          <PrimaryButton
            title="Save Changes"
            onPress={controller.submit}
            loading={controller.loading}
            disabled={!controller.name.trim()}
          />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}

export default EditAnimalScreen
