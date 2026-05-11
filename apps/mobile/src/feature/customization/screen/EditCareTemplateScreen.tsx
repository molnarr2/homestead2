import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useEditCareTemplateController } from './EditCareTemplateController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditCareTemplate'>
type Route = RouteProp<RootStackParamList, 'EditCareTemplate'>

const CARE_TYPES: { label: string; value: 'careRecurring' | 'careSingle' }[] = [
  { label: 'Recurring', value: 'careRecurring' },
  { label: 'One-time', value: 'careSingle' },
]

const EditCareTemplateScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const controller = useEditCareTemplateController(navigation, route)

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">
          {controller.isEditing ? 'Edit Care Template' : 'New Care Template'}
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
          placeholder="e.g. Quarterly Deworming"
          autoCapitalize="words"
        />

        <Text className="text-sm font-medium text-text-primary mb-1">Type</Text>
        <View className="flex-row gap-2 mb-4">
          {CARE_TYPES.map(ct => {
            const isSelected = controller.type === ct.value
            return (
              <TouchableOpacity
                key={ct.value}
                className={`flex-1 py-2 rounded-lg border items-center ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
                onPress={() => controller.setType(ct.value)}
                activeOpacity={0.7}
              >
                <Text className={`text-sm font-medium ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>
                  {ct.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {controller.type === 'careRecurring' && (
          <TextInput
            label="Cycle (days)"
            value={controller.cycle}
            onChangeText={controller.setCycle}
            placeholder="e.g. 90"
            keyboardType="number-pad"
          />
        )}

        <TextInput
          label="Contact Name"
          value={controller.contactName}
          onChangeText={controller.setContactName}
          placeholder="Optional provider name"
          autoCapitalize="words"
        />

        <TextInput
          label="Contact Phone"
          value={controller.contactPhone}
          onChangeText={controller.setContactPhone}
          placeholder="Optional provider phone"
          keyboardType="phone-pad"
        />

        <View className="mt-4 mb-8">
          <PrimaryButton
            title={controller.isEditing ? 'Save Changes' : 'Create Template'}
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

export default EditCareTemplateScreen
