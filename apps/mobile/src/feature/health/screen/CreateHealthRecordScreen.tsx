import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCreateHealthRecordController } from './CreateHealthRecordController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import HealthRecordTypeSelector from '../component/HealthRecordTypeSelector'
import VaccinationFields from '../component/VaccinationFields'
import MedicationFields from '../component/MedicationFields'
import DewormingFields from '../component/DewormingFields'
import VetVisitFields from '../component/VetVisitFields'
import IllnessInjuryFields from '../component/IllnessInjuryFields'
import AnimalPickerModal from '../../care/component/AnimalPickerModal'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateHealthRecord'>
type Route = RouteProp<RootStackParamList, 'CreateHealthRecord'>

const CreateHealthRecordScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const c = useCreateHealthRecordController(navigation, route)
  const [groupPickerVisible, setGroupPickerVisible] = useState(false)

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={c.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Add Health Record</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text className="text-sm font-medium text-text-primary mb-1 mt-4">Record Type</Text>
        <HealthRecordTypeSelector selected={c.recordType} onSelect={c.setRecordType} />

        {c.showGroupPicker && (
          <>
            <Text className="text-sm font-medium text-text-primary mb-1 mt-2">Apply to Group (optional)</Text>
            <TouchableOpacity
              className="flex-row items-center border border-border-light rounded-lg px-3 py-3 mb-4 bg-surface"
              onPress={() => setGroupPickerVisible(true)}
              activeOpacity={0.7}
            >
              {c.selectedGroup ? (
                <>
                  <View className="w-10 h-10 rounded-full bg-backgroundDark items-center justify-center mr-3">
                    <Icon name="account-group" size={20} color="#4A6741" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-text-primary">{c.selectedGroup.name}</Text>
                    <Text className="text-sm text-text-secondary">
                      {c.selectedGroup.animalIds.length} member{c.selectedGroup.animalIds.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={c.clearGroupSelection} activeOpacity={0.7} className="p-1">
                    <Icon name="close-circle" size={20} color="#BDBDBD" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View className="w-10 h-10 rounded-full bg-backgroundDark items-center justify-center mr-3">
                    <Icon name="account-group" size={20} color="#BDBDBD" />
                  </View>
                  <Text className="flex-1 text-base text-text-secondary">Select Group (optional)</Text>
                  <Icon name="chevron-right" size={20} color="#BDBDBD" />
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        <TextInput
          label="Name *"
          value={c.name}
          onChangeText={c.setName}
          placeholder="e.g. Rabies Vaccine, Penicillin"
          autoCapitalize="words"
        />

        <TextInput
          label="Date *"
          value={c.date}
          onChangeText={c.setDate}
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
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
            title="Save Health Record"
            onPress={c.submit}
            loading={c.loading}
            disabled={!c.name.trim()}
          />
        </View>
      </ScrollView>

      {c.showGroupPicker && (
        <AnimalPickerModal
          visible={groupPickerVisible}
          onClose={() => setGroupPickerVisible(false)}
          animals={c.animals}
          onSelect={() => {}}
          onSelectGroup={(groupId) => {
            c.handleSelectGroup(groupId)
          }}
          showGroups={true}
        />
      )}
    </ScreenContainer>
  )
}

export default CreateHealthRecordScreen
