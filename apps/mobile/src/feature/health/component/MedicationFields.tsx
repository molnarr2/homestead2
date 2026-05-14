import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import TextInput from '../../../components/input/TextInput'
import type { DosageUnit, MedicationRoute, WithdrawalType } from '../../../schema/health/HealthRecord'
import { addDays, formatDate } from '../../../util/DateUtility'
import { DOSAGE_UNITS, MEDICATION_ROUTES, WITHDRAWAL_TYPES } from '../constants/healthConstants'

interface Props {
  date: string
  medicationDosage: number
  setMedicationDosage: (v: number) => void
  medicationDosageUnit: DosageUnit
  setMedicationDosageUnit: (v: DosageUnit) => void
  medicationRoute: MedicationRoute
  setMedicationRoute: (v: MedicationRoute) => void
  medicationFrequency: string
  setMedicationFrequency: (v: string) => void
  medicationWithdrawalDays: number
  setMedicationWithdrawalDays: (v: number) => void
  medicationWithdrawalType: WithdrawalType
  setMedicationWithdrawalType: (v: WithdrawalType) => void
}

const MedicationFields: React.FC<Props> = ({
  date,
  medicationDosage, setMedicationDosage,
  medicationDosageUnit, setMedicationDosageUnit,
  medicationRoute, setMedicationRoute,
  medicationFrequency, setMedicationFrequency,
  medicationWithdrawalDays, setMedicationWithdrawalDays,
  medicationWithdrawalType, setMedicationWithdrawalType,
}) => {
  return (
    <View>
      <View className="flex-row gap-2 mb-4">
        <View className="flex-1">
          <TextInput
            label="Dosage"
            value={medicationDosage > 0 ? String(medicationDosage) : ''}
            onChangeText={(text) => setMedicationDosage(parseFloat(text) || 0)}
            placeholder="Amount"
            keyboardType="numeric"
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-medium text-text-primary mb-1">Unit</Text>
          <View className="flex-row flex-wrap gap-1">
            {DOSAGE_UNITS.map(u => {
              const isSelected = medicationDosageUnit === u
              return (
                <TouchableOpacity
                  key={u}
                  className={`px-3 py-2 rounded-lg border ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
                  onPress={() => setMedicationDosageUnit(u)}
                  activeOpacity={0.7}
                >
                  <Text className={`text-xs font-medium ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>{u}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </View>

      <Text className="text-sm font-medium text-text-primary mb-1">Route</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {MEDICATION_ROUTES.map(r => {
          const isSelected = medicationRoute === r
          return (
            <TouchableOpacity
              key={r}
              className={`px-3 py-2 rounded-lg border ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
              onPress={() => setMedicationRoute(r)}
              activeOpacity={0.7}
            >
              <Text className={`text-xs font-medium ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>{r}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <TextInput
        label="Frequency"
        value={medicationFrequency}
        onChangeText={setMedicationFrequency}
        placeholder="e.g. 2x daily for 5 days"
      />

      <View className="bg-status-error/5 rounded-lg p-3 border border-status-error/20 mb-4">
        <View className="flex-row items-center mb-2">
          <Icon name="alert" size={18} color="#E53935" />
          <Text className="text-sm font-bold text-status-error ml-1">Withdrawal Period</Text>
        </View>

        <TextInput
          label="Withdrawal Days"
          value={medicationWithdrawalDays > 0 ? String(medicationWithdrawalDays) : ''}
          onChangeText={(text) => setMedicationWithdrawalDays(parseInt(text) || 0)}
          placeholder="Number of days"
          keyboardType="number-pad"
        />

        <Text className="text-sm font-medium text-text-primary mb-1">Withdrawal Type</Text>
        <View className="flex-row flex-wrap gap-2 mb-2">
          {WITHDRAWAL_TYPES.map(t => {
            const isSelected = medicationWithdrawalType === t
            return (
              <TouchableOpacity
                key={t}
                className={`px-3 py-2 rounded-lg border ${isSelected ? 'bg-status-error border-status-error' : 'bg-surface border-border-light'}`}
                onPress={() => setMedicationWithdrawalType(t)}
                activeOpacity={0.7}
              >
                <Text className={`text-sm font-medium capitalize ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>{t}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {medicationWithdrawalDays > 0 && date ? (
          <View className="flex-row items-center mt-1">
            <Icon name="calendar-clock" size={14} color="#E53935" />
            <Text className="text-xs font-medium text-status-error ml-1">
              Withdrawal ends: {formatDate(addDays(date, medicationWithdrawalDays))}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

export default MedicationFields
