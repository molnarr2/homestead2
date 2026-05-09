import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useEditHealthRecordController } from './EditHealthRecordController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import DatePickerInput from '../../../components/input/DatePickerInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import AnimalOrGroupField from '../../../components/input/AnimalOrGroupField'
import HealthRecordTypeSelector from '../component/HealthRecordTypeSelector'
import VaccinationFields from '../component/VaccinationFields'
import MedicationFields from '../component/MedicationFields'
import DewormingFields from '../component/DewormingFields'
import VetVisitFields from '../component/VetVisitFields'
import IllnessInjuryFields from '../component/IllnessInjuryFields'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditHealthRecord'>
type Route = RouteProp<RootStackParamList, 'EditHealthRecord'>

const EditHealthRecordScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const c = useEditHealthRecordController(navigation, route)

  if (!c.record) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-text-secondary">Health record not found</Text>
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
        <Text className="text-xl font-bold text-text-primary">Edit Health Record</Text>
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

        <Text className="text-sm font-medium text-text-primary mb-1">Record Type</Text>
        <HealthRecordTypeSelector selected={c.recordType} onSelect={c.setRecordType} />

        <TextInput
          label="Name *"
          value={c.name}
          onChangeText={c.setName}
          placeholder="e.g. Rabies Vaccine, Penicillin"
          autoCapitalize="words"
        />

        <DatePickerInput
          label="Date *"
          value={c.date}
          onChange={c.setDate}
        />

        {c.recordType === 'vaccination' && (
          <VaccinationFields
            vaccineLotNumber={c.vaccineLotNumber}
            setVaccineLotNumber={c.setVaccineLotNumber}
            vaccineNextDueDate={c.vaccineNextDueDate}
            setVaccineNextDueDate={c.setVaccineNextDueDate}
            vaccineRoute={c.vaccineRoute}
            setVaccineRoute={c.setVaccineRoute}
          />
        )}

        {c.recordType === 'medication' && (
          <MedicationFields
            date={c.date}
            medicationDosage={c.medicationDosage}
            setMedicationDosage={c.setMedicationDosage}
            medicationDosageUnit={c.medicationDosageUnit}
            setMedicationDosageUnit={c.setMedicationDosageUnit}
            medicationRoute={c.medicationRoute}
            setMedicationRoute={c.setMedicationRoute}
            medicationFrequency={c.medicationFrequency}
            setMedicationFrequency={c.setMedicationFrequency}
            withdrawalPeriodDays={c.withdrawalPeriodDays}
            setWithdrawalPeriodDays={c.setWithdrawalPeriodDays}
            withdrawalType={c.withdrawalType}
            setWithdrawalType={c.setWithdrawalType}
          />
        )}

        {c.recordType === 'deworming' && (
          <DewormingFields
            date={c.date}
            dewormingDosage={c.dewormingDosage}
            setDewormingDosage={c.setDewormingDosage}
            dewormingDosageUnit={c.dewormingDosageUnit}
            setDewormingDosageUnit={c.setDewormingDosageUnit}
            dewormingWithdrawalDays={c.dewormingWithdrawalDays}
            setDewormingWithdrawalDays={c.setDewormingWithdrawalDays}
            dewormingWithdrawalType={c.dewormingWithdrawalType}
            setDewormingWithdrawalType={c.setDewormingWithdrawalType}
          />
        )}

        {c.recordType === 'vetVisit' && (
          <VetVisitFields
            vetClinicName={c.vetClinicName}
            setVetClinicName={c.setVetClinicName}
            vetDiagnosis={c.vetDiagnosis}
            setVetDiagnosis={c.setVetDiagnosis}
            vetTreatmentNotes={c.vetTreatmentNotes}
            setVetTreatmentNotes={c.setVetTreatmentNotes}
            vetFollowUpDate={c.vetFollowUpDate}
            setVetFollowUpDate={c.setVetFollowUpDate}
          />
        )}

        {(c.recordType === 'illness' || c.recordType === 'injury') && (
          <IllnessInjuryFields
            symptoms={c.symptoms}
            setSymptoms={c.setSymptoms}
            treatment={c.treatment}
            setTreatment={c.setTreatment}
            resolvedDate={c.resolvedDate}
            setResolvedDate={c.setResolvedDate}
            outcome={c.outcome}
            setOutcome={c.setOutcome}
          />
        )}

        <TextInput
          label="Provider Name"
          value={c.providerName}
          onChangeText={c.setProviderName}
          placeholder="Optional"
          autoCapitalize="words"
        />

        <TextInput
          label="Provider Phone"
          value={c.providerPhone}
          onChangeText={c.setProviderPhone}
          placeholder="Optional"
          keyboardType="phone-pad"
        />

        <TextInput
          label="Cost"
          value={c.cost > 0 ? String(c.cost) : ''}
          onChangeText={(text) => c.setCost(parseFloat(text) || 0)}
          placeholder="0.00"
          keyboardType="numeric"
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
            disabled={!c.name.trim()}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

export default EditHealthRecordScreen
