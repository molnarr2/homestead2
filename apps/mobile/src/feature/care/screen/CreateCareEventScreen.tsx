import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCreateCareEventController } from './CreateCareEventController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateCareEvent'>
type Route = RouteProp<RootStackParamList, 'CreateCareEvent'>

const CreateCareEventScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const controller = useCreateCareEventController(navigation, route)

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Add Care Event</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text className="text-sm font-medium text-text-primary mb-1 mt-4">Animal *</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {controller.animals.map(animal => {
            const isSelected = controller.selectedAnimalId === animal.id
            return (
              <TouchableOpacity
                key={animal.id}
                className={`px-4 py-2 rounded-lg border ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
                onPress={() => controller.setSelectedAnimalId(animal.id)}
                activeOpacity={0.7}
              >
                <Text className={`text-sm font-medium ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>
                  {animal.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <TextInput
          label="Event Name *"
          value={controller.name}
          onChangeText={controller.setName}
          placeholder="e.g. Hoof Trimming, Deworming"
          autoCapitalize="words"
        />

        <Text className="text-sm font-medium text-text-primary mb-1">Type</Text>
        <View className="flex-row gap-2 mb-4">
          {(['careSingle', 'careRecurring'] as const).map(t => {
            const isSelected = controller.type === t
            const label = t === 'careRecurring' ? 'Recurring' : 'One-time'
            return (
              <TouchableOpacity
                key={t}
                className={`flex-1 py-2 rounded-lg border items-center ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
                onPress={() => controller.setType(t)}
                activeOpacity={0.7}
              >
                <Text className={`text-sm font-medium ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {controller.type === 'careRecurring' && (
          <TextInput
            label="Cycle (days)"
            value={controller.cycle > 0 ? String(controller.cycle) : ''}
            onChangeText={(text) => controller.setCycle(parseInt(text) || 0)}
            placeholder="e.g. 30"
            keyboardType="number-pad"
          />
        )}

        <TextInput
          label="Due Date"
          value={controller.dueDate}
          onChangeText={controller.setDueDate}
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
        />

        <TextInput
          label="Contact Name"
          value={controller.contactName}
          onChangeText={controller.setContactName}
          placeholder="Optional"
          autoCapitalize="words"
        />

        <TextInput
          label="Contact Phone"
          value={controller.contactPhone}
          onChangeText={controller.setContactPhone}
          placeholder="Optional"
          keyboardType="phone-pad"
        />

        <TextInput
          label="Notes"
          value={controller.notes}
          onChangeText={controller.setNotes}
          placeholder="Optional"
          multiline
          numberOfLines={3}
        />

        <View className="mt-4 mb-8">
          <PrimaryButton
            title="Save Care Event"
            onPress={controller.submit}
            loading={controller.loading}
            disabled={!controller.name.trim() || !controller.selectedAnimalId}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

export default CreateCareEventScreen
