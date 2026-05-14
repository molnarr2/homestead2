import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import TextInput from '../../../components/input/TextInput'
import type { DosageUnit, DewormingRoute, WithdrawalType } from '../../../schema/health/HealthRecord'
import { addDays, formatDate } from '../../../util/DateUtility'
import { DOSAGE_UNITS, DEWORMING_ROUTES, WITHDRAWAL_TYPES } from '../constants/healthConstants'

interface Props {
  date: string
  dewormingDosage: number
  setDewormingDosage: (v: number) => void
  dewormingDosageUnit: DosageUnit
  setDewormingDosageUnit: (v: DosageUnit) => void
  dewormingRoute: DewormingRoute
  setDewormingRoute: (v: DewormingRoute) => void
  dewormingWithdrawalDays: number
  setDewormingWithdrawalDays: (v: number) => void
  dewormingWithdrawalType: WithdrawalType
  setDewormingWithdrawalType: (v: WithdrawalType) => void
}

const DewormingFields: React.FC<Props> = ({
  date,
  dewormingDosage, setDewormingDosage,
  dewormingDosageUnit, setDewormingDosageUnit,
  dewormingRoute, setDewormingRoute,
  dewormingWithdrawalDays, setDewormingWithdrawalDays,
  dewormingWithdrawalType, setDewormingWithdrawalType,
}) => {
  return (
    <View>
      <View className="flex-row gap-2 mb-4">
        <View className="flex-1">
          <TextInput
            label="Dosage"
            value={dewormingDosage > 0 ? String(dewormingDosage) : ''}
            onChangeText={(text) => setDewormingDosage(parseFloat(text) || 0)}
            placeholder="Amount"
            keyboardType="numeric"
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-medium text-text-primary mb-1">Unit</Text>
          <View className="flex-row flex-wrap gap-1">
            {DOSAGE_UNITS.map(u => {
              const isSelected = dewormingDosageUnit === u
              return (
                <TouchableOpacity
                  key={u}
                  className={`px-3 py-2 rounded-lg border ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
                  onPress={() => setDewormingDosageUnit(u)}
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
        {DEWORMING_ROUTES.map(r => {
          const isSelected = dewormingRoute === r
          return (
            <TouchableOpacity
              key={r}
              className={`px-3 py-2 rounded-lg border ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
              onPress={() => setDewormingRoute(r)}
              activeOpacity={0.7}
            >
              <Text className={`text-xs font-medium ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>{r}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <View className="bg-status-error/5 rounded-lg p-3 border border-status-error/20 mb-4">
        <View className="flex-row items-center mb-2">
          <Icon name="alert" size={18} color="#E53935" />
          <Text className="text-sm font-bold text-status-error ml-1">Withdrawal Period</Text>
        </View>

        <TextInput
          label="Withdrawal Days"
          value={dewormingWithdrawalDays > 0 ? String(dewormingWithdrawalDays) : ''}
          onChangeText={(text) => setDewormingWithdrawalDays(parseInt(text) || 0)}
          placeholder="Number of days"
          keyboardType="number-pad"
        />

        <Text className="text-sm font-medium text-text-primary mb-1">Withdrawal Type</Text>
        <View className="flex-row flex-wrap gap-2 mb-2">
          {WITHDRAWAL_TYPES.map(t => {
            const isSelected = dewormingWithdrawalType === t
            return (
              <TouchableOpacity
                key={t}
                className={`px-3 py-2 rounded-lg border ${isSelected ? 'bg-status-error border-status-error' : 'bg-surface border-border-light'}`}
                onPress={() => setDewormingWithdrawalType(t)}
                activeOpacity={0.7}
              >
                <Text className={`text-sm font-medium capitalize ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>{t}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {dewormingWithdrawalDays > 0 && date ? (
          <View className="flex-row items-center mt-1">
            <Icon name="calendar-clock" size={14} color="#E53935" />
            <Text className="text-xs font-medium text-status-error ml-1">
              Withdrawal ends: {formatDate(addDays(date, dewormingWithdrawalDays))}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

export default DewormingFields
