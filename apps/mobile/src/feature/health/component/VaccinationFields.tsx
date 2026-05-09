import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import TextInput from '../../../components/input/TextInput'
import DatePickerInput from '../../../components/input/DatePickerInput'
import type { MedicationRoute } from '../../../schema/health/HealthRecord'

const ROUTES: MedicationRoute[] = ['Injection', 'Oral', 'Topical', 'IV', 'Intranasal', 'Subcutaneous', 'Intramuscular']

interface Props {
  vaccineLotNumber: string
  setVaccineLotNumber: (v: string) => void
  vaccineNextDueDate: string
  setVaccineNextDueDate: (v: string) => void
  vaccineRoute: MedicationRoute
  setVaccineRoute: (v: MedicationRoute) => void
}

const VaccinationFields: React.FC<Props> = ({
  vaccineLotNumber, setVaccineLotNumber,
  vaccineNextDueDate, setVaccineNextDueDate,
  vaccineRoute, setVaccineRoute,
}) => {
  return (
    <View>
      <TextInput
        label="Lot Number"
        value={vaccineLotNumber}
        onChangeText={setVaccineLotNumber}
        placeholder="Optional"
      />

      <Text className="text-sm font-medium text-text-primary mb-1">Route</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {ROUTES.map(r => {
          const isSelected = vaccineRoute === r
          return (
            <TouchableOpacity
              key={r}
              className={`px-3 py-2 rounded-lg border ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
              onPress={() => setVaccineRoute(r)}
              activeOpacity={0.7}
            >
              <Text className={`text-xs font-medium ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>
                {r}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <DatePickerInput
        label="Next Due Date"
        value={vaccineNextDueDate}
        onChange={setVaccineNextDueDate}
        placeholder="Select date (auto-creates care reminder)"
      />
    </View>
  )
}

export default VaccinationFields
