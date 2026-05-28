import { useState } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalStore } from '../../../store/animalStore'
import { useGroupStore } from '../../../store/groupStore'
import { useCareStore } from '../../../store/careStore'
import { bsHealthService, bsGroupService, bsCareService } from '../../../Bootstrap'
import type HealthRecord from '../../../schema/health/HealthRecord'
import { healthRecord_default, HealthRecordType, DosageUnit, MedicationRoute, DewormingRoute, WithdrawalType } from '../../../schema/health/HealthRecord'
import { todayIso } from '../../../util/DateUtility'
import { careEvent_default } from '../../../schema/care/CareEvent'
import { dateToTstamp } from '../../../schema/type/Tstamp'
import { adminObject_default } from '../../../schema/object/AdminObject'
import { format } from 'date-fns'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateHealthRecord'>
type Route = RouteProp<RootStackParamList, 'CreateHealthRecord'>

const SCHEDULE_NEXT_TYPES: HealthRecordType[] = ['vaccination', 'deworming', 'medication', 'vetVisit']

export function useCreateHealthRecordController(navigation: Navigation, route: Route) {
  const {
    animalId: routeAnimalId,
    recordType: initialType,
    groupId: routeGroupId,
    name: routeName,
    providerName: routeProviderName,
    providerPhone: routeProviderPhone,
    date: routeDate,
    careEventId: routeCareEventId,
    careEventGroupId: routeCareEventGroupId,
  } = route.params

  const { animals } = useAnimalStore()
  const { groups, groupCareEvents } = useGroupStore()
  const { careEvents } = useCareStore()
  const [selectedAnimalId, setSelectedAnimalId] = useState(routeGroupId ? '' : (routeAnimalId ?? ''))
  const [selectedGroupId, setSelectedGroupId] = useState(routeGroupId ?? '')

  const [recordType, setRecordType] = useState<HealthRecordType>(initialType ?? 'vaccination')
  const [name, setName] = useState(routeName ?? '')
  const [date, setDate] = useState(routeDate ?? todayIso())
  const [providerName, setProviderName] = useState(routeProviderName ?? '')
  const [providerPhone, setProviderPhone] = useState(routeProviderPhone ?? '')
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
  const [medicationWithdrawalDays, setMedicationWithdrawalDays] = useState(0)
  const [medicationWithdrawalType, setMedicationWithdrawalType] = useState<WithdrawalType>('meat')

  const [dewormingDosage, setDewormingDosage] = useState(0)
  const [dewormingDosageUnit, setDewormingDosageUnit] = useState<DosageUnit>('mL')
  const [dewormingRoute, setDewormingRoute] = useState<DewormingRoute>('Oral')
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
  const [futureDateModalVisible, setFutureDateModalVisible] = useState(false)
  const [scheduleNextModalVisible, setScheduleNextModalVisible] = useState(false)
  const [scheduleNextDate, setScheduleNextDate] = useState('')

  const validate = (): string | null => {
    if (!name.trim() || (!selectedAnimalId && !selectedGroupId)) {
      return 'Please enter a name and select an animal or group.'
    }

    if (recordType === 'medication') {
      if (medicationDosage < 0) return 'Dosage cannot be negative.'
      if (medicationWithdrawalDays < 0) return 'Withdrawal days cannot be negative.'
    }

    if (recordType === 'deworming') {
      if (dewormingDosage < 0) return 'Dosage cannot be negative.'
      if (dewormingWithdrawalDays < 0) return 'Withdrawal days cannot be negative.'
    }

    if (cost < 0) return 'Cost cannot be negative.'

    return null
  }

  const isFutureDate = (): boolean => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return date.slice(0, 10) > today
  }

  const buildRecord = (): HealthRecord => ({
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
      medicationWithdrawalDays, medicationWithdrawalType,
    }),
    ...(recordType === 'deworming' && {
      dewormingDosage, dewormingDosageUnit, dewormingRoute, dewormingWithdrawalDays, dewormingWithdrawalType,
    }),
    ...(recordType === 'vetVisit' && { vetClinicName, vetDiagnosis, vetTreatmentNotes, vetFollowUpDate }),
    ...((recordType === 'illness' || recordType === 'injury') && { symptoms, treatment, resolvedDate, outcome }),
  })

  const submit = async () => {
    const error = validate()
    if (error) {
      Alert.alert('Required', error)
      return
    }

    if (isFutureDate()) {
      setFutureDateModalVisible(true)
      return
    }

    await saveRecord()
  }

  const saveRecord = async () => {
    setLoading(true)
    const record = buildRecord()

    let result
    if (selectedGroupId) {
      result = await bsGroupService.createGroupHealthRecord(selectedGroupId, record, photoUri || undefined)
    } else {
      result = await bsHealthService.createHealthRecord(record, photoUri || undefined)
    }
    setLoading(false)

    if (result.success) {
      if (routeCareEventId) {
        await completeCareEvent()
      }

      const fromCareEvent = !!routeCareEventId
      const isScheduleNextType = SCHEDULE_NEXT_TYPES.includes(recordType)
      if (!fromCareEvent && isScheduleNextType) {
        setScheduleNextModalVisible(true)
      } else {
        navigation.goBack()
      }
    } else {
      Alert.alert('Error', result.error)
    }
  }

  const completeCareEvent = async () => {
    if (!routeCareEventId) return
    const groupId = routeCareEventGroupId
    if (groupId) {
      const event = (groupCareEvents[groupId] ?? []).find(e => e.id === routeCareEventId)
      if (event) {
        await bsGroupService.completeGroupCareEvent(groupId, event)
      }
    } else {
      const event = careEvents.find(e => e.id === routeCareEventId)
      if (event) {
        await bsCareService.completeCareEvent(event)
      }
    }
  }

  const onFutureDateCreateReminder = () => {
    setFutureDateModalVisible(false)
    const animalId = selectedAnimalId || routeAnimalId
    navigation.replace('CreateCareEvent', {
      animalId: animalId ?? '',
      groupId: selectedGroupId || undefined,
      name: name.trim(),
      dueDate: date,
      contactName: providerName,
      contactPhone: providerPhone,
      healthRecordType: recordType,
    })
  }

  const onFutureDateSaveAnyway = async () => {
    setFutureDateModalVisible(false)
    await saveRecord()
  }

  const onFutureDateClose = () => {
    setFutureDateModalVisible(false)
  }

  const onScheduleNextReminder = async () => {
    if (!scheduleNextDate) {
      Alert.alert('Required', 'Please select a date for the reminder.')
      return
    }

    setLoading(true)
    const event = {
      ...careEvent_default(),
      animalId: selectedAnimalId,
      name: name.trim(),
      type: 'careSingle' as const,
      cycle: 0,
      dueDate: dateToTstamp(new Date(scheduleNextDate)),
      contactName: providerName,
      contactPhone: providerPhone,
      healthRecordType: recordType,
      admin: adminObject_default(),
    }

    if (selectedGroupId) {
      await bsGroupService.createGroupCareEvent(selectedGroupId, event)
    } else {
      await bsCareService.createCareEvent(event)
    }

    setLoading(false)
    setScheduleNextModalVisible(false)
    navigation.goBack()
  }

  const onScheduleNextSkip = () => {
    setScheduleNextModalVisible(false)
    navigation.goBack()
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
    medicationWithdrawalDays, setMedicationWithdrawalDays,
    medicationWithdrawalType, setMedicationWithdrawalType,
    dewormingDosage, setDewormingDosage,
    dewormingDosageUnit, setDewormingDosageUnit,
    dewormingRoute, setDewormingRoute,
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
    futureDateModalVisible,
    onFutureDateCreateReminder,
    onFutureDateSaveAnyway,
    onFutureDateClose,
    scheduleNextModalVisible,
    scheduleNextDate, setScheduleNextDate,
    onScheduleNextReminder,
    onScheduleNextSkip,
  }
}
