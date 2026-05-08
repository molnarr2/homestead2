import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useWeightLogDetailController } from './WeightLogDetailController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import Icon from '@react-native-vector-icons/material-design-icons'
import { formatDate } from '../../../util/DateUtility'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'WeightLogDetail'>
type Route = RouteProp<RootStackParamList, 'WeightLogDetail'>

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

const WeightLogDetailScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const controller = useWeightLogDetailController(navigation, route)

  if (!controller.log) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-text-secondary">Weight log not found</Text>
        </View>
      </ScreenContainer>
    )
  }

  const { log, animal } = controller

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Weight Log</Text>
        <TouchableOpacity onPress={controller.onEdit} activeOpacity={0.7} className="p-1">
          <Icon name="pencil" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center mt-4">
          <View className="bg-primary/10 rounded-full p-2 mr-3">
            <Icon name="scale-bathroom" size={24} color="#4A6741" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-text-primary">{log.weight} {log.weightUnit}</Text>
          </View>
        </View>

        {animal ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('AnimalDetail', { animalId: animal.id })}
            activeOpacity={0.7}
          >
            <Text className="text-base text-primary mt-2">{animal.name}</Text>
          </TouchableOpacity>
        ) : null}

        <View className="mt-4 bg-surface rounded-xl p-4 border border-border-light">
          <DetailRow label="Date" value={formatDate(log.date)} />
          <DetailRow label="Weight" value={`${log.weight} ${log.weightUnit}`} />
          {log.bodyConditionScore > 0 && (
            <DetailRow label="Body Condition Score" value={String(log.bodyConditionScore)} />
          )}
        </View>

        {log.notes ? (
          <View className="mt-4 bg-surface rounded-xl p-4 border border-border-light">
            <Text className="text-sm font-medium text-text-secondary mb-1">Notes</Text>
            <Text className="text-base text-text-primary">{log.notes}</Text>
          </View>
        ) : null}

        <View className="mb-8" />
      </ScrollView>
    </ScreenContainer>
  )
}

export default WeightLogDetailScreen
