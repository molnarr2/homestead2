import React from 'react'
import { View } from 'react-native'
import TextInput from '../../../components/input/TextInput'
import DatePickerInput from '../../../components/input/DatePickerInput'

interface Props {
  vetClinicName: string
  setVetClinicName: (v: string) => void
  vetDiagnosis: string
  setVetDiagnosis: (v: string) => void
  vetTreatmentNotes: string
  setVetTreatmentNotes: (v: string) => void
  vetFollowUpDate: string
  setVetFollowUpDate: (v: string) => void
}

const VetVisitFields: React.FC<Props> = ({
  vetClinicName, setVetClinicName,
  vetDiagnosis, setVetDiagnosis,
  vetTreatmentNotes, setVetTreatmentNotes,
  vetFollowUpDate, setVetFollowUpDate,
}) => {
  return (
    <View>
      <TextInput
        label="Clinic Name"
        value={vetClinicName}
        onChangeText={setVetClinicName}
        placeholder="Vet clinic name"
        autoCapitalize="words"
      />
      <TextInput
        label="Diagnosis"
        value={vetDiagnosis}
        onChangeText={setVetDiagnosis}
        placeholder="Diagnosis"
      />
      <TextInput
        label="Treatment Notes"
        value={vetTreatmentNotes}
        onChangeText={setVetTreatmentNotes}
        placeholder="Treatment details"
        multiline
        numberOfLines={3}
      />
      <DatePickerInput
        label="Follow-up Date"
        value={vetFollowUpDate}
        onChange={setVetFollowUpDate}
      />
    </View>
  )
}

export default VetVisitFields
