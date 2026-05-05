import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import AnimalType from '../../../schema/animalType/AnimalType'

interface Props {
  visible: boolean
  onClose: () => void
  animalTypes: AnimalType[]
  selectedType: string | null
  onTypeChange: (type: string | null) => void
  onReset: () => void
}

const CareFilterModal: React.FC<Props> = ({
  visible,
  onClose,
  animalTypes,
  selectedType,
  onTypeChange,
  onReset,
}) => {
  const [localType, setLocalType] = useState<string | null>(selectedType)

  const handleOpen = () => {
    setLocalType(selectedType)
  }

  const toggleType = (typeId: string) => {
    setLocalType(prev => prev === typeId ? null : typeId)
  }

  const handleReset = () => {
    setLocalType(null)
  }

  const handleApply = () => {
    onTypeChange(localType)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      onShow={handleOpen}
    >
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-border-light">
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="p-1">
            <Icon name="close" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text-primary">Filters</Text>
          <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
            <Text className="text-sm font-medium text-primary">Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {animalTypes.length > 0 ? (
            <View className="mt-4">
              <Text className="text-base font-semibold text-text-primary mb-2">Animal Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {animalTypes.map(type => {
                  const isSelected = localType === type.id
                  return (
                    <TouchableOpacity
                      key={type.id}
                      className={`px-3 py-1.5 rounded-full border ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-border-light'}`}
                      onPress={() => toggleType(type.id)}
                      activeOpacity={0.7}
                    >
                      <Text className={`text-sm font-medium ${isSelected ? 'text-text-inverse' : 'text-text-secondary'}`}>
                        {type.name}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View className="px-4 pb-8 pt-3 border-t border-border-light">
          <TouchableOpacity
            className="bg-primary py-3 rounded-xl items-center"
            onPress={handleApply}
            activeOpacity={0.7}
          >
            <Text className="text-base font-bold text-text-inverse">Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default CareFilterModal
