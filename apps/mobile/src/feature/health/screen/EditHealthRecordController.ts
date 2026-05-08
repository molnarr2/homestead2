import { useState } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useHealthStore } from '../../../store/healthStore'
import { bsHealthService } from '../../../Bootstrap'
import type HealthRecord from '../../../schema/health/HealthRecord'
import { HealthRecordType, DosageUnit, MedicationRoute, WithdrawalType } from '../../../schema/health/HealthRecord'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditHealthRecord'>
type Route = RouteProp<RootStackParamList, 'EditHealthRecord'>

export function useEditHealthRecordController(navigation: Navigation, route: Route) {
  const { recordId } = route.params
  const record = useHealthStore(s => s.healthRecords.find(r => r.id === recordId))

  const [recordType, setRecordType] = useState<HealthRecordType>(record?.recordType ?? 'vaccination')
  const [name, setName] = useState(record?.name ?? '')
  const [date, setDate] = useState(record?.date ?? '')
  const [providerName, setProviderName] = useState(record?.providerName ?? '')
  const [providerPhone, setProviderPhone] = useState(record?.providerPhone ?? '')
  const [notes, setNotes] = useState(record?.notes ?? '')
  const [cost, setCost] = useState(record?.cost ?? 0)
  const [photoUri, setPhotoUri] = useState('')

  const [vaccineLotNumber, setVaccineLotNumber] = useState(record?.vaccineLotNumber ?? '')
  const [vaccineNextDueDate, setVaccineNextDueDate] = useState(record?.vaccineNextDueDate ?? '')
  const [vaccineRoute, setVaccineRoute] = useState<MedicationRoute>(record?.vaccineRoute ?? 'Injection')

  const [medicationDosage, setMedicationDosage] = useState(record?.medicationDosage ?? 0)
  const [medicationDosageUnit, setMedicationDosageUnit] = useState<DosageUnit>(record?.medicationDosageUnit ?? 'mL')
  const [medicationRoute, setMedicationRoute] = useState<MedicationRoute>(record?.medicationRoute ?? 'Oral')
  const [medicationFrequency, setMedicationFrequency] = useState(record?.medicationFrequency ?? '')
  const [withdrawalPeriodDays, setWithdrawalPeriodDays] = useState(record?.withdrawalPeriodDays ?? 0)
  const [withdrawalType, setWithdrawalType] = useState<WithdrawalType>(record?.withdrawalType ?? 'meat')

  const [dewormingDosage, setDewormingDosage] = useState(record?.dewormingDosage ?? 0)
  const [dewormingDosageUnit, setDewormingDosageUnit] = useState<DosageUnit>(record?.dewormingDosageUnit ?? 'mL')
  const [dewormingWithdrawalDays, setDewormingWithdrawalDays] = useState(record?.dewormingWithdrawalDays ?? 0)
  const [dewormingWithdrawalType, setDewormingWithdrawalType] = useState<WithdrawalType>(record?.dewormingWithdrawalType ?? 'meat')

  const [vetClinicName, setVetClinicName] = useState(record?.vetClinicName ?? '')
  const [vetDiagnosis, setVetDiagnosis] = useState(record?.vetDiagnosis ?? '')
  const [vetTreatmentNotes, setVetTreatmentNotes] = useState(record?.vetTreatmentNotes ?? '')
  const [vetFollowUpDate, setVetFollowUpDate] = useState(record?.vetFollowUpDate ?? '')

  const [symptoms, setSymptoms] = useState(record?.symptoms ?? '')
  const [treatment, setTreatment] = useState(record?.treatment ?? '')
  const [resolvedDate, setResolvedDate] = useState(record?.resolvedDate ?? '')
  const [outcome, setOutcome] = useState(record?.outcome ?? '')

  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!record) return
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a name.')
      return
    }

    setLoading(true)

    const updated: HealthRecord = {
      ...record,
      recordType,
      name: name.trim(),
      date,
      providerName,
      providerPhone,
      notes,
      cost,
      ...(recordType === 'vaccination' && { vaccineLotNumber, vaccineNextDueDate, vaccineRoute }),
      ...(recordType === 'medication' && {
        medicationDosage, medicationDosageUnit, medicationRoute, medicationFrequency,
        withdrawalPeriodDays, withdrawalType,
      }),
      ...(recordType === 'deworming' && {
        dewormingDosage, dewormingDosageUnit, dewormingWithdrawalDays, dewormingWithdrawalType,
      }),
      ...(recordType === 'vetVisit' && { vetClinicName, vetDiagnosis, vetTreatmentNotes, vetFollowUpDate }),
      ...((recordType === 'illness' || recordType === 'injury') && { symptoms, treatment, resolvedDate, outcome }),
    }

    const newPhotoUri = photoUri && photoUri !== record.photoUrl ? photoUri : undefined
    const result = await bsHealthService.updateHealthRecord(updated, newPhotoUri)
    setLoading(false)
    if (result.success) {
      navigation.goBack()
    } else {
      Alert.alert('Error', result.error)
    }
  }

  const onBack = () => navigation.goBack()

  return {
    record,
    recordType, setRecordType,
    name, setName,
    date, setDate,
    providerName, setProviderName,
    providerPhone, setProviderPhone,
    notes, setNotes,
    cost, setCost,
    photoUri, setPhotoUri,
    vaccineLotNumber, setVaccineLotNumber,
    vaccineNextDueDate, setVaccineNextDueDate,
    vaccineRoute, setVaccineRoute,
    medicationDosage, setMedicationDosage,
    medicationDosageUnit, setMedicationDosageUnit,
    medicationRoute, setMedicationRoute,
    medicationFrequency, setMedicationFrequency,
    withdrawalPeriodDays, setWithdrawalPeriodDays,
    withdrawalType, setWithdrawalType,
    dewormingDosage, setDewormingDosage,
    dewormingDosageUnit, setDewormingDosageUnit,
    dewormingWithdrawalDays, setDewormingWithdrawalDays,
    dewormingWithdrawalType, setDewormingWithdrawalType,
    vetClinicName, setVetClinicName,
    vetDiagnosis, setVetDiagnosis,
    vetTreatmentNotes, setVetTreatmentNotes,
    vetFollowUpDate, setVetFollowUpDate,
    symptoms, setSymptoms,
    treatment, setTreatment,
    resolvedDate, setResolvedDate,
    outcome, setOutcome,
    loading,
    submit,
    onBack,
  }
}
