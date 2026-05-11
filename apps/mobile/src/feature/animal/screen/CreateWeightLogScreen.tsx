import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCreateWeightLogController } from './CreateWeightLogController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import DatePickerInput from '../../../components/input/DatePickerInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import AnimalOrGroupField from '../../../components/input/AnimalOrGroupField'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateWeightLog'>
type Route = RouteProp<RootStackParamList, 'CreateWeightLog'>

const UNITS: { value: 'lbs' | 'kg'; label: string }[] = [
  { value: 'lbs', label: 'lbs' },
  { value: 'kg', label: 'kg' },
]

const BCS_VALUES = [1, 2, 3, 4, 5]

const CreateWeightLogScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const c = useCreateWeightLogController(navigation, route)

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={c.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Add Weight Log</Text>
        <View className="w-8" />
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <AnimalOrGroupField
          selectedAnimal={c.selectedAnimal}
          selectedGroup={null}
          onPress={() => {}}
          readOnly={true}
          label="Animal"
          showGroups={false}
        />

        <DatePickerInput
          label="Date *"
          value={c.date}
          onChange={c.setDate}
        />

        <TextInput
          label="Weight *"
          value={c.weight}
          onChangeText={c.setWeight}
          placeholder="0"
          keyboardType="numeric"
        />

        <Text className="text-sm font-medium text-text-primary mb-2">Unit</Text>
        <View className="flex-row gap-2 mb-4">
          {UNITS.map(u => (
            <TouchableOpacity
              key={u.value}
              className={`flex-1 py-2 rounded-lg border items-center ${
                c.weightUnit === u.value ? 'bg-primary border-primary' : 'bg-surface border-border-light'
              }`}
              onPress={() => c.setWeightUnit(u.value)}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-medium ${
                c.weightUnit === u.value ? 'text-text-inverse' : 'text-text-primary'
              }`}>
                {u.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-sm font-medium text-text-primary mb-2">Body Condition Score</Text>
        <View className="flex-row gap-2 mb-4">
          {BCS_VALUES.map(v => (
            <TouchableOpacity
              key={v}
              className={`flex-1 py-2 rounded-lg border items-center ${
                c.bodyConditionScore === v ? 'bg-primary border-primary' : 'bg-surface border-border-light'
              }`}
              onPress={() => c.setBodyConditionScore(v)}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-medium ${
                c.bodyConditionScore === v ? 'text-text-inverse' : 'text-text-primary'
              }`}>
                {v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          label="Notes"
          value={c.notes}
          onChangeText={c.setNotes}
          placeholder="Optional"
          multiline
          numberOfLines={3}
        />

        <View className="mt-4 mb-8">
          <PrimaryButton
            title="Save Weight Log"
            onPress={c.submit}
            loading={c.loading}
          />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}

export default CreateWeightLogScreen
