import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import CareTemplate from '../../../schema/animalType/CareTemplate'
import SectionHeader from '../../../components/layout/SectionHeader'

interface Props {
  templates: CareTemplate[]
  onAdd: () => void
  onEdit: (templateId: string) => void
}

const CareTemplateList: React.FC<Props> = ({ templates, onAdd, onEdit }) => {
  return (
    <View>
      <View className="flex-row items-center justify-between">
        <SectionHeader title="Care Templates" count={templates.length} />
        <TouchableOpacity onPress={onAdd} activeOpacity={0.7} className="p-2">
          <Icon name="plus" size={22} color="#4A6741" />
        </TouchableOpacity>
      </View>
      {templates.map(template => (
        <TouchableOpacity
          key={template.id}
          className="bg-surface rounded-lg p-3 mb-2 flex-row items-center border border-border-light"
          onPress={() => onEdit(template.id)}
          activeOpacity={0.7}
        >
          <View className="flex-1">
            <Text className="text-base text-text-primary">{template.name}</Text>
            <Text className="text-sm text-text-secondary">
              {template.type === 'careRecurring' ? `Recurring · every ${template.cycle} days` : 'One-time'}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default CareTemplateList
