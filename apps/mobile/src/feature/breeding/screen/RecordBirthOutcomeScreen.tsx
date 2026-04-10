import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useRecordBirthOutcomeController } from './RecordBirthOutcomeController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import PrimaryButton from '../../../components/button/PrimaryButton'
import BirthOutcomeForm from '../component/BirthOutcomeForm'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'RecordBirthOutcome'>
type Route = RouteProp<RootStackParamList, 'RecordBirthOutcome'>

const RecordBirthOutcomeScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const c = useRecordBirthOutcomeController(navigation, route)

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={c.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Record Birth</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {c.dam && (
          <View className="bg-surface rounded-xl p-4 border border-border-light mt-4 mb-4">
            <Text className="text-sm text-text-secondary">Dam</Text>
            <Text className="text-lg font-bold text-text-primary">{c.dam.name}</Text>
            <Text className="text-sm text-text-secondary">{c.dam.breed || c.dam.animalType}</Text>
          </View>
        )}

        <BirthOutcomeForm
          birthDate={c.birthDate}
          setBirthDate={c.setBirthDate}
          bornAlive={c.bornAlive}
          setBornAlive={c.setBornAlive}
          stillborn={c.stillborn}
          setStillborn={c.setStillborn}
          complications={c.complications}
          setComplications={c.setComplications}
          damCondition={c.damCondition}
          setDamCondition={c.setDamCondition}
        />

        <View className="mt-4 mb-8">
          <PrimaryButton
            title="Save Birth Outcome"
            onPress={c.submit}
            loading={c.loading}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

export default RecordBirthOutcomeScreen
