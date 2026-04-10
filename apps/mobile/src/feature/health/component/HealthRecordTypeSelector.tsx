import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import type { HealthRecordType } from '../../../schema/health/HealthRecord'

type IconName = React.ComponentProps<typeof Icon>['name']

interface Props {
  selected: HealthRecordType
  onSelect: (type: HealthRecordType) => void
}

const TYPES: { type: HealthRecordType; label: string; icon: IconName }[] = [
  { type: 'vaccination', label: 'Vaccination', icon: 'needle' },
  { type: 'medication', label: 'Medication', icon: 'pill' },
  { type: 'deworming', label: 'Deworming', icon: 'bug' },
  { type: 'vetVisit', label: 'Vet Visit', icon: 'stethoscope' },
  { type: 'illness', label: 'Illness', icon: 'thermometer' },
  { type: 'injury', label: 'Injury', icon: 'bandage' },
]

const HealthRecordTypeSelector: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <View className="flex-row flex-wrap gap-2 mb-4">
      {TYPES.map(({ type, label, icon }) => {
        const isSelected = selected === type
        return (
          <TouchableOpacity
            key={type}
            className={`flex-row items-center px-3 py-2 rounded-lg border ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
            onPress={() => onSelect(type)}
            activeOpacity={0.7}
          >
            <Icon name={icon} size={16} color={isSelected ? '#FFFFFF' : '#4A6741'} />
            <Text className={`text-sm font-medium ml-1 ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>
              {label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default HealthRecordTypeSelector
