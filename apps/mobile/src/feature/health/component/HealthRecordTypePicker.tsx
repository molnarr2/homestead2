import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import type { HealthRecordType } from '../../../schema/health/HealthRecord'
import { HEALTH_RECORD_TYPES } from '../constants/healthConstants'

interface Props {
  selected: HealthRecordType | ''
  onSelect: (type: HealthRecordType | '') => void
}

const OPTIONS = [
  { type: '' as const, label: 'None', icon: 'close-circle-outline' as const },
  ...HEALTH_RECORD_TYPES.filter(t => t.type !== 'illness' && t.type !== 'injury'),
]

const HealthRecordTypePicker: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-text-primary mb-1">Health Record Type</Text>
      <View className="flex-row flex-wrap gap-2">
        {OPTIONS.map(({ type, label, icon }) => {
          const isSelected = selected === type
          return (
            <TouchableOpacity
              key={type || 'none'}
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
    </View>
  )
}

export default HealthRecordTypePicker
