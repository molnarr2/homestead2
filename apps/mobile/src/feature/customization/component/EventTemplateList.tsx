import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import EventTemplate from '../../../schema/animalType/EventTemplate'
import SectionHeader from '../../../components/layout/SectionHeader'

interface Props {
  templates: EventTemplate[]
  onAdd: () => void
}

const EventTemplateList: React.FC<Props> = ({ templates, onAdd }) => {
  return (
    <View>
      <View className="flex-row items-center justify-between">
        <SectionHeader title="Event Templates" count={templates.length} />
        <TouchableOpacity onPress={onAdd} activeOpacity={0.7} className="p-2">
          <Icon name="plus" size={22} color="#4A6741" />
        </TouchableOpacity>
      </View>
      {templates.map(template => (
        <View
          key={template.id}
          className="bg-surface rounded-lg p-3 mb-2 flex-row items-center border border-border-light"
        >
          <Text className="text-base text-text-primary flex-1">{template.name}</Text>
        </View>
      ))}
    </View>
  )
}

export default EventTemplateList
