import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useEditWeightLogController } from './EditWeightLogController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import DatePickerInput from '../../../components/input/DatePickerInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditWeightLog'>
type Route = RouteProp<RootStackParamList, 'EditWeightLog'>

const UNITS: { value: 'lbs' | 'kg'; label: string }[] = [
  { value: 'lbs', label: 'lbs' },
  { value: 'kg', label: 'kg' },
]

const BCS_VALUES = [1, 2, 3, 4, 5]

const EditWeightLogScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const c = useEditWeightLogController(navigation, route)

  if (!c.log) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-text-secondary">Weight log not found</Text>
        </View>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={c.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Edit Weight Log</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {c.animal && (
          <View className="bg-surface rounded-xl p-4 border border-border-light mt-4">
            <Text className="text-sm text-text-secondary">Animal</Text>
            <Text className="text-lg font-bold text-text-primary">{c.animal.name}</Text>
            <Text className="text-sm text-text-secondary">{c.animal.breed || c.animal.animalType}</Text>
          </View>
        )}

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
            title="Save Changes"
            onPress={c.submit}
            loading={c.loading}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

export default EditWeightLogScreen
