import React from 'react'
import { View, Text, Pressable } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import SectionHeader from '../../../components/layout/SectionHeader'

interface QuickAction {
  label: string
  icon: React.ComponentProps<typeof Icon>['name']
  onPress: () => void
}

interface Props {
  onLogProduction: () => void
  onAddWeight: () => void
  onRecordCare: () => void
  onAddAnimal: () => void
}

const QuickActionsSection: React.FC<Props> = ({
  onLogProduction,
  onAddWeight,
  onRecordCare,
  onAddAnimal,
}) => {
  const actions: QuickAction[] = [
    { label: 'Log Production', icon: 'egg-outline', onPress: onLogProduction },
    { label: 'Add Weight', icon: 'scale', onPress: onAddWeight },
    { label: 'Record Care', icon: 'medical-bag', onPress: onRecordCare },
    { label: 'Add Animal', icon: 'plus-circle-outline', onPress: onAddAnimal },
  ]

  return (
    <View>
      <SectionHeader title="Quick Actions" />
      <View className="flex-row justify-between">
        {actions.map(action => (
          <Pressable
            key={action.label}
            className="items-center flex-1"
            onPress={action.onPress}
          >
            <View className="bg-surface rounded-full w-12 h-12 items-center justify-center mb-1">
              <Icon name={action.icon} size={24} color="#4A6741" />
            </View>
            <Text className="text-xs text-text-secondary text-center">{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

export default QuickActionsSection
