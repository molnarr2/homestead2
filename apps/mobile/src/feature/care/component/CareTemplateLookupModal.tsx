import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, SectionList } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import SearchBar from '../../../components/input/SearchBar'
import { AnimalTypeCareTemplate } from '../../../schema/animalType/AnimalType'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'

interface Props {
  visible: boolean
  onClose: () => void
  onSelect: (template: AnimalTypeCareTemplate) => void
  onGoToCustomization: () => void
}

type Section = { title: string; data: AnimalTypeCareTemplate[] }

const CareTemplateLookupModal: React.FC<Props> = ({ visible, onClose, onSelect, onGoToCustomization }) => {
  const [search, setSearch] = useState('')
  const { animalTypes } = useAnimalTypeStore()

  const handleOpen = () => {
    setSearch('')
  }

  const handleSelect = (template: AnimalTypeCareTemplate) => {
    onSelect(template)
    onClose()
  }

  const sections: Section[] = animalTypes
    .map(at => ({
      title: at.name,
      data: at.careTemplates.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(s => s.data.length > 0)

  const renderItem = ({ item }: { item: AnimalTypeCareTemplate }) => {
    const typeLabel = item.type === 'careRecurring' ? 'Recurring' : 'One-time'
    const subtitle = item.type === 'careRecurring'
      ? `${typeLabel} - every ${item.cycle} days`
      : typeLabel

    return (
      <TouchableOpacity
        className="mx-4 mb-2 bg-surface rounded-xl p-3 border border-border-light"
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <Text className="text-base font-semibold text-text-primary">{item.name}</Text>
        <Text className="text-sm text-text-secondary">{subtitle}</Text>
        {item.contactName ? (
          <Text className="text-sm text-text-secondary">Contact: {item.contactName}</Text>
        ) : null}
      </TouchableOpacity>
    )
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
          <Text className="text-lg font-bold text-text-primary">Care Templates</Text>
          <View className="w-8" />
        </View>

        <View className="mt-3 mb-2">
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search templates..." />
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <View className="px-4 pt-3 pb-1">
              <Text className="text-xs font-bold text-text-secondary uppercase">{section.title}</Text>
            </View>
          )}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-base text-text-secondary">No care templates found</Text>
            </View>
          }
          ListFooterComponent={
            <TouchableOpacity
              className="mx-4 mt-4 mb-8 flex-row items-center justify-center py-3 rounded-xl bg-surface border border-border-light"
              onPress={onGoToCustomization}
              activeOpacity={0.7}
            >
              <Icon name="cog" size={20} color="#4A6741" />
              <Text className="text-sm font-medium text-primary ml-2">Manage Templates</Text>
            </TouchableOpacity>
          }
        />
      </View>
    </Modal>
  )
}

export default CareTemplateLookupModal
