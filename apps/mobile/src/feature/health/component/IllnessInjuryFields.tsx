import React from 'react'
import { View } from 'react-native'
import TextInput from '../../../components/input/TextInput'

interface Props {
  symptoms: string
  setSymptoms: (v: string) => void
  treatment: string
  setTreatment: (v: string) => void
  resolvedDate: string
  setResolvedDate: (v: string) => void
  outcome: string
  setOutcome: (v: string) => void
}

const IllnessInjuryFields: React.FC<Props> = ({
  symptoms, setSymptoms,
  treatment, setTreatment,
  resolvedDate, setResolvedDate,
  outcome, setOutcome,
}) => {
  return (
    <View>
      <TextInput
        label="Symptoms"
        value={symptoms}
        onChangeText={setSymptoms}
        placeholder="Describe symptoms"
        multiline
        numberOfLines={3}
      />
      <TextInput
        label="Treatment"
        value={treatment}
        onChangeText={setTreatment}
        placeholder="Treatment administered"
        multiline
        numberOfLines={3}
      />
      <TextInput
        label="Resolved Date"
        value={resolvedDate}
        onChangeText={setResolvedDate}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
      />
      <TextInput
        label="Outcome"
        value={outcome}
        onChangeText={setOutcome}
        placeholder="e.g. Recovered, Ongoing, Referred"
      />
    </View>
  )
}

export default IllnessInjuryFields
