import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native'
import { getVersion, getBuildNumber } from 'react-native-device-info'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import Icon from '@react-native-vector-icons/material-design-icons'
import { useSettingsController } from './SettingsController'

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>

interface UnitOptionProps {
  label: string
  selected: boolean
  onPress: () => void
}

const UnitOption: React.FC<UnitOptionProps> = ({ label, selected, onPress }) => (
  <TouchableOpacity
    className={`px-4 py-2 rounded-lg border ${selected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text className={`text-sm font-medium ${selected ? 'text-text-inverse' : 'text-text-primary'}`}>
      {label}
    </Text>
  </TouchableOpacity>
)

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const c = useSettingsController()

  return (
    <ScreenContainer>
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-left" size={24} color="#333333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text-primary ml-3">Settings</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-sm font-semibold text-text-secondary uppercase mb-2">Notifications</Text>
        <View className="bg-surface rounded-xl px-4 py-3 flex-row items-center justify-between border border-border-light mb-6">
          <Text className="text-base text-text-primary">Push Notifications</Text>
          <Switch
            value={c.notificationsEnabled}
            onValueChange={c.onToggleNotifications}
          />
        </View>

        <Text className="text-sm font-semibold text-text-secondary uppercase mb-2">Units</Text>
        <View className="bg-surface rounded-xl px-4 py-3 border border-border-light mb-3">
          <Text className="text-base text-text-primary mb-2">Weight</Text>
          <View className="flex-row">
            <View className="mr-2">
              <UnitOption label="lbs" selected={c.weightUnit === 'lbs'} onPress={() => c.onChangeWeightUnit('lbs')} />
            </View>
            <UnitOption label="kg" selected={c.weightUnit === 'kg'} onPress={() => c.onChangeWeightUnit('kg')} />
          </View>
        </View>
        <View className="bg-surface rounded-xl px-4 py-3 border border-border-light mb-6">
          <Text className="text-base text-text-primary mb-2">Milk Volume</Text>
          <View className="flex-row">
            <View className="mr-2">
              <UnitOption label="Gallons" selected={c.milkUnit === 'gallons'} onPress={() => c.onChangeMilkUnit('gallons')} />
            </View>
            <UnitOption label="Liters" selected={c.milkUnit === 'liters'} onPress={() => c.onChangeMilkUnit('liters')} />
          </View>
        </View>

        <Text className="text-sm font-semibold text-text-secondary uppercase mb-2">App Info</Text>
        <View className="bg-surface rounded-xl px-4 border border-border-light mb-6">
          <View className="flex-row items-center justify-between py-3 border-b border-border-light">
            <Text className="text-base text-text-primary">Version</Text>
            <Text className="text-base text-text-secondary">{getVersion()}</Text>
          </View>
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-base text-text-primary">Build</Text>
            <Text className="text-base text-text-secondary">{getBuildNumber()}</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

export default SettingsScreen
