import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useEditGroupController } from './EditGroupController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import GroupMemberPicker from '../component/GroupMemberPicker'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditGroup'>
type Route = RouteProp<RootStackParamList, 'EditGroup'>

const EditGroupScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const controller = useEditGroupController(navigation, route)

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">
          {controller.isEditing ? 'Edit Group' : 'Create Group'}
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TextInput
          label="Group Name *"
          value={controller.name}
          onChangeText={controller.setName}
          placeholder="e.g. Laying Hens, Breeding Does"
          autoCapitalize="words"
        />

        <Text className="text-sm font-medium text-text-primary mb-1">Members ({controller.selectedAnimalIds.length})</Text>
        <TouchableOpacity
          className="border border-border-light rounded-lg px-3 py-3 mb-4 bg-surface flex-row items-center"
          onPress={() => controller.setMemberPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Icon name="account-group" size={20} color="#6B6B6B" />
          <Text className="flex-1 text-base text-text-secondary ml-2">
            {controller.selectedAnimalIds.length > 0
              ? `${controller.selectedAnimalIds.length} animal${controller.selectedAnimalIds.length !== 1 ? 's' : ''} selected`
              : 'Select animals'}
          </Text>
          <Icon name="chevron-right" size={20} color="#BDBDBD" />
        </TouchableOpacity>

        <View className="mt-4 mb-8">
          <PrimaryButton
            title={controller.isEditing ? 'Save Changes' : 'Create Group'}
            onPress={controller.submit}
            loading={controller.loading}
            disabled={!controller.name.trim()}
          />
        </View>
      </ScrollView>

      <GroupMemberPicker
        visible={controller.memberPickerVisible}
        onClose={() => controller.setMemberPickerVisible(false)}
        animals={controller.ownedAnimals}
        selectedIds={controller.selectedAnimalIds}
        onToggle={controller.toggleAnimal}
      />
    </ScreenContainer>
  )
}

export default EditGroupScreen
