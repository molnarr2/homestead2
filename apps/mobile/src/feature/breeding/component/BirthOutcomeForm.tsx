import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import TextInput from '../../../components/input/TextInput'
import type { DamCondition } from '../../../schema/breeding/BreedingRecord'

interface Props {
  birthDate: string
  setBirthDate: (v: string) => void
  bornAlive: number
  setBornAlive: (v: number) => void
  stillborn: number
  setStillborn: (v: number) => void
  complications: string
  setComplications: (v: string) => void
  damCondition: DamCondition
  setDamCondition: (v: DamCondition) => void
}

const DAM_CONDITIONS: DamCondition[] = ['Good', 'Fair', 'Poor']

const BirthOutcomeForm: React.FC<Props> = ({
  birthDate, setBirthDate,
  bornAlive, setBornAlive,
  stillborn, setStillborn,
  complications, setComplications,
  damCondition, setDamCondition,
}) => {
  return (
    <View>
      <TextInput
        label="Birth Date *"
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
      />

      <TextInput
        label="Born Alive *"
        value={bornAlive > 0 ? String(bornAlive) : ''}
        onChangeText={(text) => setBornAlive(Math.max(0, parseInt(text) || 0))}
        placeholder="0"
        keyboardType="numeric"
      />

      <TextInput
        label="Stillborn"
        value={stillborn > 0 ? String(stillborn) : ''}
        onChangeText={(text) => setStillborn(Math.max(0, parseInt(text) || 0))}
        placeholder="0"
        keyboardType="numeric"
      />

      <TextInput
        label="Complications"
        value={complications}
        onChangeText={setComplications}
        placeholder="Optional"
        multiline
        numberOfLines={3}
      />

      <Text className="text-sm font-medium text-text-primary mb-2">Dam Condition</Text>
      <View className="flex-row gap-2 mb-4">
        {DAM_CONDITIONS.map(condition => (
          <TouchableOpacity
            key={condition}
            className={`flex-1 py-2 rounded-lg border items-center ${
              damCondition === condition ? 'bg-primary border-primary' : 'bg-surface border-border-light'
            }`}
            onPress={() => setDamCondition(condition)}
            activeOpacity={0.7}
          >
            <Text className={`text-sm font-medium ${
              damCondition === condition ? 'text-text-inverse' : 'text-text-primary'
            }`}>
              {condition}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

export default BirthOutcomeForm
