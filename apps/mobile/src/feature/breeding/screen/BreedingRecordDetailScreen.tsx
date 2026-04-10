import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useBreedingRecordDetailController } from './BreedingRecordDetailController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import PrimaryButton from '../../../components/button/PrimaryButton'
import SecondaryButton from '../../../components/button/SecondaryButton'
import GestationCountdown from '../component/GestationCountdown'
import OffspringList from '../component/OffspringList'
import Icon from '@react-native-vector-icons/material-design-icons'
import { formatDate } from '../../../util/DateUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'BreedingRecordDetail'>
type Route = RouteProp<RootStackParamList, 'BreedingRecordDetail'>

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

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-status-warning',
  completed: 'bg-status-success',
  failed: 'bg-status-error',
}

const BreedingRecordDetailScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const controller = useBreedingRecordDetailController(navigation, route)

  if (!controller.record) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-text-secondary">Breeding record not found</Text>
        </View>
      </ScreenContainer>
    )
  }

  const { record, dam, sire, gestationStatus, offspring } = controller

  const confirmMarkFailed = () => {
    Alert.alert(
      'Mark as Failed',
      'Are you sure you want to mark this breeding as failed? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark Failed', style: 'destructive', onPress: controller.onMarkFailed },
      ]
    )
  }

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Breeding Record</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center mt-4 mb-2">
          <View className={`px-2 py-0.5 rounded-full ${STATUS_COLORS[record.status] ?? 'bg-border-light'}`}>
            <Text className="text-xs font-bold text-text-inverse capitalize">{record.status}</Text>
          </View>
        </View>

        <View className="bg-surface rounded-xl p-4 border border-border-light">
          <DetailRow label="Dam" value={dam?.name ?? ''} />
          <DetailRow label="Sire" value={sire?.name ?? record.sireName} />
          <DetailRow label="Breeding Date" value={formatDate(record.breedingDate)} />
          <DetailRow label="Method" value={record.method} />
        </View>

        {record.status === 'active' && gestationStatus && (
          <View className="mt-4">
            <GestationCountdown gestationStatus={gestationStatus} />
          </View>
        )}

        {record.status === 'completed' && (
          <View className="mt-4 bg-surface rounded-xl p-4 border border-border-light">
            <Text className="text-base font-bold text-text-primary mb-2">Birth Outcome</Text>
            <DetailRow label="Birth Date" value={formatDate(record.birthDate)} />
            <DetailRow label="Born Alive" value={String(record.bornAlive)} />
            {record.stillborn > 0 && <DetailRow label="Stillborn" value={String(record.stillborn)} />}
            {record.complications ? <DetailRow label="Complications" value={record.complications} /> : null}
            <DetailRow label="Dam Condition" value={record.damCondition} />
          </View>
        )}

        {record.status === 'completed' && (
          <OffspringList offspring={offspring} onAnimalPress={controller.onAnimalPress} />
        )}

        {record.notes ? (
          <View className="mt-4 bg-surface rounded-xl p-4 border border-border-light">
            <Text className="text-sm font-medium text-text-secondary mb-1">Notes</Text>
            <Text className="text-base text-text-primary">{record.notes}</Text>
          </View>
        ) : null}

        {record.status === 'active' && (
          <View className="mt-6 gap-3 mb-8">
            <PrimaryButton title="Record Birth" onPress={controller.onRecordBirth} />
            <SecondaryButton title="Mark as Failed" onPress={confirmMarkFailed} />
          </View>
        )}

        {record.status !== 'active' && <View className="mb-8" />}
      </ScrollView>
    </ScreenContainer>
  )
}

export default BreedingRecordDetailScreen
