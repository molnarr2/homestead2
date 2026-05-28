import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Modal } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCreateHealthRecordController } from './CreateHealthRecordController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import DatePickerInput from '../../../components/input/DatePickerInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import HealthRecordTypeSelector from '../component/HealthRecordTypeSelector'
import VaccinationFields from '../component/VaccinationFields'
import MedicationFields from '../component/MedicationFields'
import DewormingFields from '../component/DewormingFields'
import VetVisitFields from '../component/VetVisitFields'
import IllnessInjuryFields from '../component/IllnessInjuryFields'
import AnimalOrGroupField from '../../../components/input/AnimalOrGroupField'
import AnimalPickerModal from '../../care/component/AnimalPickerModal'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateHealthRecord'>
type Route = RouteProp<RootStackParamList, 'CreateHealthRecord'>

const CreateHealthRecordScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const c = useCreateHealthRecordController(navigation, route)
  const [pickerVisible, setPickerVisible] = useState(false)

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={c.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Add Health Record</Text>
        <View className="w-8" />
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <AnimalOrGroupField
          selectedAnimal={c.selectedAnimal}
          selectedGroup={c.selectedGroup}
          onPress={() => setPickerVisible(true)}
          readOnly={c.isReadOnly}
          label="Animal or Group *"
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
            medicationWithdrawalDays={c.medicationWithdrawalDays}
            setMedicationWithdrawalDays={c.setMedicationWithdrawalDays}
            medicationWithdrawalType={c.medicationWithdrawalType}
            setMedicationWithdrawalType={c.setMedicationWithdrawalType}
          />
        )}

        {c.recordType === 'deworming' && (
          <DewormingFields
            date={c.date}
            dewormingDosage={c.dewormingDosage}
            setDewormingDosage={c.setDewormingDosage}
            dewormingDosageUnit={c.dewormingDosageUnit}
            setDewormingDosageUnit={c.setDewormingDosageUnit}
            dewormingRoute={c.dewormingRoute}
            setDewormingRoute={c.setDewormingRoute}
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
            title="Save Health Record"
            onPress={c.submit}
            loading={c.loading}
            disabled={!c.name.trim() || (!c.selectedAnimalId && !c.selectedGroupId)}
          />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {!c.isReadOnly && (
        <AnimalPickerModal
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          animals={c.animals}
          onSelect={c.handleSelectAnimal}
          onSelectGroup={c.handleSelectGroup}
          showGroups={true}
        />
      )}

      <Modal visible={c.futureDateModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-background rounded-2xl p-6 w-full max-w-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-text-primary">Future Date</Text>
              <TouchableOpacity onPress={c.onFutureDateClose} activeOpacity={0.7}>
                <Icon name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-text-secondary mb-6">
              The date you selected is in the future. Would you like to create a care reminder instead?
            </Text>
            <TouchableOpacity
              className="bg-primary py-3 rounded-lg items-center mb-3"
              onPress={c.onFutureDateCreateReminder}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold text-text-inverse">Create Care Reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-surface border border-border-light py-3 rounded-lg items-center"
              onPress={c.onFutureDateSaveAnyway}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold text-text-primary">Save Anyway</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={c.scheduleNextModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-background rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-lg font-bold text-text-primary mb-2">Schedule Next?</Text>
            <Text className="text-sm text-text-secondary mb-4">
              Would you like to schedule a reminder for the next {c.recordType === 'vetVisit' ? 'vet visit' : c.recordType}?
            </Text>
            <DatePickerInput
              label="Reminder Date"
              value={c.scheduleNextDate}
              onChange={c.setScheduleNextDate}
            />
            <TouchableOpacity
              className="bg-primary py-3 rounded-lg items-center mb-3 mt-2"
              onPress={c.onScheduleNextReminder}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold text-text-inverse">Schedule Reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-3 rounded-lg items-center"
              onPress={c.onScheduleNextSkip}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold text-text-secondary">Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  )
}

export default CreateHealthRecordScreen
