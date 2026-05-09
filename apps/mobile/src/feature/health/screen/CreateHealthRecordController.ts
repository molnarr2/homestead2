import { useState } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useHomesteadStore } from '../../../store/homesteadStore'
import { useAnimalStore } from '../../../store/animalStore'
import { useGroupStore } from '../../../store/groupStore'
import { effectiveSubscription } from '../../subscription/service/ISubscriptionService'
import { bsHealthService, bsGroupService } from '../../../Bootstrap'
import type HealthRecord from '../../../schema/health/HealthRecord'
import { healthRecord_default, HealthRecordType, DosageUnit, MedicationRoute, WithdrawalType } from '../../../schema/health/HealthRecord'
import { todayIso } from '../../../util/DateUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateHealthRecord'>
type Route = RouteProp<RootStackParamList, 'CreateHealthRecord'>

export function useCreateHealthRecordController(navigation: Navigation, route: Route) {
  const { animalId: routeAnimalId, recordType: initialType, groupId: routeGroupId } = route.params

  const homestead = useHomesteadStore(s => s.homestead)
  const { animals } = useAnimalStore()
  const { groups } = useGroupStore()
  const [selectedAnimalId, setSelectedAnimalId] = useState(routeGroupId ? '' : (routeAnimalId ?? ''))
  const [selectedGroupId, setSelectedGroupId] = useState(routeGroupId ?? '')

  const [recordType, setRecordType] = useState<HealthRecordType>(initialType ?? 'vaccination')
  const [name, setName] = useState('')
  const [date, setDate] = useState(todayIso())
  const [providerName, setProviderName] = useState('')
  const [providerPhone, setProviderPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [cost, setCost] = useState(0)
  const [photoUri, setPhotoUri] = useState('')

  const [vaccineLotNumber, setVaccineLotNumber] = useState('')
  const [vaccineNextDueDate, setVaccineNextDueDate] = useState('')
  const [vaccineRoute, setVaccineRoute] = useState<MedicationRoute>('Injection')

  const [medicationDosage, setMedicationDosage] = useState(0)
  const [medicationDosageUnit, setMedicationDosageUnit] = useState<DosageUnit>('mL')
  const [medicationRoute, setMedicationRoute] = useState<MedicationRoute>('Oral')
  const [medicationFrequency, setMedicationFrequency] = useState('')
  const [withdrawalPeriodDays, setWithdrawalPeriodDays] = useState(0)
  const [withdrawalType, setWithdrawalType] = useState<WithdrawalType>('meat')

  const [dewormingDosage, setDewormingDosage] = useState(0)
  const [dewormingDosageUnit, setDewormingDosageUnit] = useState<DosageUnit>('mL')
  const [dewormingWithdrawalDays, setDewormingWithdrawalDays] = useState(0)
  const [dewormingWithdrawalType, setDewormingWithdrawalType] = useState<WithdrawalType>('meat')

  const [vetClinicName, setVetClinicName] = useState('')
  const [vetDiagnosis, setVetDiagnosis] = useState('')
  const [vetTreatmentNotes, setVetTreatmentNotes] = useState('')
  const [vetFollowUpDate, setVetFollowUpDate] = useState('')

  const [symptoms, setSymptoms] = useState('')
  const [treatment, setTreatment] = useState('')
  const [resolvedDate, setResolvedDate] = useState('')
  const [outcome, setOutcome] = useState('')

  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!name.trim() || (!selectedAnimalId && !selectedGroupId)) {
      Alert.alert('Required', 'Please enter a name and select an animal or group.')
      return
    }

    const tier = effectiveSubscription(homestead)
    if (tier === 'free') {
      Alert.alert(
        'Pro Feature',
        'Health records are available with a Pro or Farm subscription. Upgrade to track vaccinations, medications, and withdrawal periods.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
        ]
      )
      return
    }

    setLoading(true)

    const record: HealthRecord = {
      ...healthRecord_default(),
      animalId: selectedAnimalId,
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

    let result
    if (selectedGroupId) {
      result = await bsGroupService.createGroupHealthRecord(selectedGroupId, record, photoUri || undefined)
    } else {
      result = await bsHealthService.createHealthRecord(record, photoUri || undefined)
    }
    setLoading(false)
    if (result.success) {
      navigation.goBack()
    } else {
      Alert.alert('Error', result.error)
    }
  }

  const handleSelectAnimal = (animalId: string) => {
    setSelectedAnimalId(animalId)
    setSelectedGroupId('')
  }

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId)
    setSelectedAnimalId('')
  }

  const isReadOnly = !!(routeAnimalId || routeGroupId)
  const selectedAnimal = animals.find(a => a.id === selectedAnimalId) ?? null
  const selectedGroup = groups.find(g => g.id === selectedGroupId) ?? null

  const onBack = () => navigation.goBack()

  return {
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
    selectedAnimalId,
    handleSelectAnimal,
    selectedGroupId,
    handleSelectGroup,
    isReadOnly,
    selectedAnimal,
    selectedGroup,
    animals,
  }
}
