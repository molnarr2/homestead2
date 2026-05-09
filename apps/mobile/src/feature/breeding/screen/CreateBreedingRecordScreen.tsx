import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCreateBreedingRecordController } from './CreateBreedingRecordController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import DatePickerInput from '../../../components/input/DatePickerInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import SireSelector from '../component/SireSelector'
import Icon from '@react-native-vector-icons/material-design-icons'
import { formatDate } from '../../../util/DateUtility'
import { BreedingMethod } from '../../../schema/breeding/BreedingRecord'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateBreedingRecord'>
type Route = RouteProp<RootStackParamList, 'CreateBreedingRecord'>

const METHODS: { value: BreedingMethod; label: string }[] = [
  { value: 'natural', label: 'Natural' },
  { value: 'ai', label: 'AI' },
  { value: 'other', label: 'Other' },
]

const CreateBreedingRecordScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const c = useCreateBreedingRecordController(navigation, route)

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={c.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Add Breeding Record</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {c.dam && (
          <View className="bg-surface rounded-xl p-4 border border-border-light mt-4">
            <Text className="text-sm text-text-secondary">Dam</Text>
            <Text className="text-lg font-bold text-text-primary">{c.dam.name}</Text>
            <Text className="text-sm text-text-secondary">{c.dam.breed || c.dam.animalType}</Text>
          </View>
        )}

        <View className="mt-4">
          <SireSelector
            animalTypeId={c.dam?.animalTypeId ?? ''}
            animals={c.animals}
            selectedId={c.sireId}
            manualName={c.sireName}
            onSelect={c.onSireSelect}
            onManualNameChange={c.onManualSireNameChange}
          />
        </View>

        <DatePickerInput
          label="Breeding Date *"
          value={c.breedingDate}
          onChange={c.setBreedingDate}
        />

        <Text className="text-sm font-medium text-text-primary mb-2">Method</Text>
        <View className="flex-row gap-2 mb-4">
          {METHODS.map(m => (
            <TouchableOpacity
              key={m.value}
              className={`flex-1 py-2 rounded-lg border items-center ${
                c.method === m.value ? 'bg-primary border-primary' : 'bg-surface border-border-light'
              }`}
              onPress={() => c.setMethod(m.value)}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-medium ${
                c.method === m.value ? 'text-text-inverse' : 'text-text-primary'
              }`}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {c.gestationStatus && (
          <View className="bg-primary/5 rounded-xl p-4 border border-primary/20 mb-4">
            <Text className="text-sm font-medium text-primary">
              {c.gestationDays} day {c.gestationStatus.label}
            </Text>
            <Text className="text-base font-bold text-text-primary mt-1">
              Expected: {formatDate(c.gestationStatus.expectedDueDate)}
            </Text>
          </View>
        )}

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
            title="Save Breeding Record"
            onPress={c.submit}
            loading={c.loading}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

export default CreateBreedingRecordScreen
