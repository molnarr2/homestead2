import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useHealthRecordDetailController } from './HealthRecordDetailController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import WithdrawalStatusCard from '../component/WithdrawalStatusCard'
import Icon from '@react-native-vector-icons/material-design-icons'
import { formatDate } from '../../../util/DateUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'HealthRecordDetail'>
type Route = RouteProp<RootStackParamList, 'HealthRecordDetail'>

type IconName = React.ComponentProps<typeof Icon>['name']

const RECORD_TYPE_ICONS: Record<string, IconName> = {
  vaccination: 'needle',
  medication: 'pill',
  deworming: 'bug',
  vetVisit: 'stethoscope',
  illness: 'thermometer',
  injury: 'bandage',
}

interface DetailRowProps {
  label: string
  value: string
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  if (!value) return null
  return (
    <View className="flex-row justify-between py-2 border-b border-border-light">
      <Text className="text-sm text-text-secondary">{label}</Text>
      <Text className="text-sm font-medium text-text-primary">{value}</Text>
    </View>
  )
}

const HealthRecordDetailScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const controller = useHealthRecordDetailController(navigation, route)

  if (!controller.record) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-text-secondary">Health record not found</Text>
        </View>
      </ScreenContainer>
    )
  }

  const { record, animal, withdrawalStatus } = controller

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Health Record</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center mt-4">
          <View className="bg-primary/10 rounded-full p-2 mr-3">
            <Icon name={RECORD_TYPE_ICONS[record.recordType] || 'medical-bag'} size={24} color="#4A6741" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-text-primary">{record.name}</Text>
            <View className="flex-row items-center mt-1">
              <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                <Text className="text-xs font-medium text-primary capitalize">{record.recordType}</Text>
              </View>
            </View>
          </View>
        </View>

        {animal ? (
          <TouchableOpacity onPress={controller.onAnimalPress} activeOpacity={0.7}>
            <Text className="text-base text-primary mt-2">{animal.name}</Text>
          </TouchableOpacity>
        ) : null}

        {withdrawalStatus ? (
          <View className="mt-4">
            <WithdrawalStatusCard
              withdrawal={withdrawalStatus}
              recordName={record.name}
              animalName={animal?.name ?? ''}
            />
          </View>
        ) : null}

        <View className="mt-4 bg-surface rounded-xl p-4 border border-border-light">
          <DetailRow label="Date" value={formatDate(record.date)} />

          {(record.recordType === 'medication' || record.recordType === 'vaccination') && (
            <>
              {record.medicationDosage > 0 && (
                <DetailRow label="Dosage" value={`${record.medicationDosage} ${record.medicationDosageUnit}`} />
              )}
              {record.medicationRoute && <DetailRow label="Route" value={record.medicationRoute} />}
              {record.medicationFrequency && <DetailRow label="Frequency" value={record.medicationFrequency} />}
            </>
          )}

          {record.recordType === 'vaccination' && (
            <>
              {record.vaccineLotNumber && <DetailRow label="Lot Number" value={record.vaccineLotNumber} />}
              {record.vaccineRoute && <DetailRow label="Route" value={record.vaccineRoute} />}
              {record.vaccineNextDueDate && <DetailRow label="Next Due Date" value={formatDate(record.vaccineNextDueDate)} />}
            </>
          )}

          {record.recordType === 'deworming' && (
            <>
              {record.dewormingDosage > 0 && (
                <DetailRow label="Dosage" value={`${record.dewormingDosage} ${record.dewormingDosageUnit}`} />
              )}
            </>
          )}

          {record.recordType === 'medication' && record.withdrawalPeriodDays > 0 && (
            <DetailRow label="Withdrawal Period" value={`${record.withdrawalPeriodDays} days (${record.withdrawalType})`} />
          )}

          {record.recordType === 'deworming' && record.dewormingWithdrawalDays > 0 && (
            <DetailRow label="Withdrawal Period" value={`${record.dewormingWithdrawalDays} days (${record.dewormingWithdrawalType})`} />
          )}

          {record.recordType === 'vetVisit' && (
            <>
              {record.vetClinicName && <DetailRow label="Clinic" value={record.vetClinicName} />}
              {record.vetDiagnosis && <DetailRow label="Diagnosis" value={record.vetDiagnosis} />}
              {record.vetTreatmentNotes && <DetailRow label="Treatment" value={record.vetTreatmentNotes} />}
              {record.vetFollowUpDate && <DetailRow label="Follow-up" value={formatDate(record.vetFollowUpDate)} />}
            </>
          )}

          {(record.recordType === 'illness' || record.recordType === 'injury') && (
            <>
              {record.symptoms && <DetailRow label="Symptoms" value={record.symptoms} />}
              {record.treatment && <DetailRow label="Treatment" value={record.treatment} />}
              {record.resolvedDate && <DetailRow label="Resolved" value={formatDate(record.resolvedDate)} />}
              {record.outcome && <DetailRow label="Outcome" value={record.outcome} />}
            </>
          )}

          {record.providerName && <DetailRow label="Provider" value={record.providerName} />}
          {record.providerPhone && <DetailRow label="Phone" value={record.providerPhone} />}
          {record.cost > 0 && <DetailRow label="Cost" value={`$${record.cost.toFixed(2)}`} />}
        </View>

        {record.notes ? (
          <View className="mt-4 bg-surface rounded-xl p-4 border border-border-light">
            <Text className="text-sm font-medium text-text-secondary mb-1">Notes</Text>
            <Text className="text-base text-text-primary">{record.notes}</Text>
          </View>
        ) : null}

        {record.photoUrl ? (
          <View className="mt-4 mb-8">
            <Image source={{ uri: record.photoUrl }} className="w-full h-48 rounded-xl" resizeMode="cover" />
          </View>
        ) : <View className="mb-8" />}
      </ScrollView>
    </ScreenContainer>
  )
}

export default HealthRecordDetailScreen
