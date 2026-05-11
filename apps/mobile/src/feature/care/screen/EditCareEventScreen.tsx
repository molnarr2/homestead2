import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useEditCareEventController } from './EditCareEventController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import DatePickerInput from '../../../components/input/DatePickerInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import AnimalOrGroupField from '../../../components/input/AnimalOrGroupField'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditCareEvent'>
type Route = RouteProp<RootStackParamList, 'EditCareEvent'>

const EditCareEventScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const c = useEditCareEventController(navigation, route)

  if (!c.event) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-text-secondary">Care event not found</Text>
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
        <Text className="text-xl font-bold text-text-primary">Edit Care Event</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <AnimalOrGroupField
          selectedAnimal={c.selectedAnimal}
          selectedGroup={c.selectedGroup}
          onPress={() => {}}
          readOnly={true}
          label="Animal or Group"
          showGroups={true}
        />

        <TextInput
          label="Event Name *"
          value={c.name}
          onChangeText={c.setName}
          placeholder="e.g. Hoof Trimming, Deworming"
          autoCapitalize="words"
        />

        <Text className="text-sm font-medium text-text-primary mb-1">Type</Text>
        <View className="flex-row gap-2 mb-4">
          {(['careSingle', 'careRecurring'] as const).map(t => {
            const isSelected = c.type === t
            const label = t === 'careRecurring' ? 'Recurring' : 'One-time'
            return (
              <TouchableOpacity
                key={t}
                className={`flex-1 py-2 rounded-lg border items-center ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
                onPress={() => c.setType(t)}
                activeOpacity={0.7}
              >
                <Text className={`text-sm font-medium ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {c.type === 'careRecurring' && (
          <TextInput
            label="Cycle (days)"
            value={c.cycle > 0 ? String(c.cycle) : ''}
            onChangeText={(text) => c.setCycle(parseInt(text) || 0)}
            placeholder="e.g. 30"
            keyboardType="number-pad"
          />
        )}

        <DatePickerInput
          label="Due Date *"
          value={c.dueDate}
          onChange={c.setDueDate}
        />

        <TextInput
          label="Contact Name"
          value={c.contactName}
          onChangeText={c.setContactName}
          placeholder="Optional"
          autoCapitalize="words"
        />

        <TextInput
          label="Contact Phone"
          value={c.contactPhone}
          onChangeText={c.setContactPhone}
          placeholder="Optional"
          keyboardType="phone-pad"
        />

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
            disabled={!c.name.trim() || !c.dueDate}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

export default EditCareEventScreen
