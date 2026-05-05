import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, SectionList } from 'react-native'
import TurboImage from 'react-native-turbo-image'
import Icon from '@react-native-vector-icons/material-design-icons'
import SearchBar from '../../../components/input/SearchBar'
import Animal from '../../../schema/animal/Animal'
import AnimalGroup from '../../../schema/animalGroup/AnimalGroup'
import { useGroupStore } from '../../../store/groupStore'

export type AnimalPickerSelection = { type: 'animal'; animalId: string } | { type: 'group'; groupId: string }

interface Props {
  visible: boolean
  onClose: () => void
  animals: Animal[]
  onSelect: (animalId: string) => void
  onSelectGroup?: (groupId: string) => void
  showGroups?: boolean
}

const AnimalPickerModal: React.FC<Props> = ({ visible, onClose, animals, onSelect, onSelectGroup, showGroups = false }) => {
  const [search, setSearch] = useState('')
  const { groups } = useGroupStore()

  const handleOpen = () => {
    setSearch('')
  }

  const filtered = animals.filter(a =>
    a.state === 'own' && a.name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (animalId: string) => {
    onSelect(animalId)
    onClose()
  }

  const handleSelectGroup = (groupId: string) => {
    onSelectGroup?.(groupId)
    onClose()
  }

  type SectionItem = { type: 'animal'; item: Animal } | { type: 'group'; item: AnimalGroup }
  type Section = { title: string; data: SectionItem[] }

  const sections: Section[] = []
  if (showGroups && filteredGroups.length > 0) {
    sections.push({
      title: 'Groups',
      data: filteredGroups.map(g => ({ type: 'group' as const, item: g })),
    })
  }
  if (filtered.length > 0) {
    sections.push({
      title: 'Animals',
      data: filtered.map(a => ({ type: 'animal' as const, item: a })),
    })
  }

  const renderItem = ({ item: sectionItem }: { item: SectionItem }) => {
    if (sectionItem.type === 'group') {
      const group = sectionItem.item
      return (
        <TouchableOpacity
          className="mx-4 mb-2 bg-surface rounded-xl p-3 flex-row items-center border border-border-light"
          onPress={() => handleSelectGroup(group.id)}
          activeOpacity={0.7}
        >
          <View className="w-12 h-12 rounded-full bg-backgroundDark items-center justify-center mr-3 overflow-hidden">
            {group.photoUrl ? (
              <TurboImage
                source={{ uri: group.photoUrl }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
                cachePolicy="dataCache"
              />
            ) : (
              <Icon name="account-group" size={24} color="#6B6B6B" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-text-primary">{group.name}</Text>
            <Text className="text-sm text-text-secondary">
              {group.animalIds.length} member{group.animalIds.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </TouchableOpacity>
      )
    }

    const animal = sectionItem.item
    return (
      <TouchableOpacity
        className="mx-4 mb-2 bg-surface rounded-xl p-3 flex-row items-center border border-border-light"
        onPress={() => handleSelect(animal.id)}
        activeOpacity={0.7}
      >
        <View className="w-12 h-12 rounded-full bg-backgroundDark items-center justify-center mr-3 overflow-hidden">
          {animal.photoUrl ? (
            <TurboImage
              source={{ uri: animal.photoUrl }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              cachePolicy="dataCache"
            />
          ) : (
            <Text className="text-lg font-semibold text-text-secondary">{animal.name.charAt(0)}</Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-text-primary">{animal.name}</Text>
          <Text className="text-sm text-text-secondary capitalize">
            {animal.gender !== 'unknown' ? animal.gender : ''}{animal.gender !== 'unknown' && animal.register ? ' · ' : ''}{animal.register ? `#${animal.register}` : ''}
          </Text>
        </View>
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
          <Text className="text-lg font-bold text-text-primary">Select Animal</Text>
          <View className="w-8" />
        </View>

        <View className="mt-3 mb-2">
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name..." />
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.type === 'group' ? `group-${item.item.id}` : `animal-${item.item.id}`}
          renderSectionHeader={({ section }) => (
            <View className="px-4 pt-3 pb-1">
              <Text className="text-xs font-bold text-text-secondary uppercase">{section.title}</Text>
            </View>
          )}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-base text-text-secondary">No animals found</Text>
            </View>
          }
        />
      </View>
    </Modal>
  )
}

export default AnimalPickerModal
