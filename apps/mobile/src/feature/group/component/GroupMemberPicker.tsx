import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native'
import TurboImage from 'react-native-turbo-image'
import Icon from '@react-native-vector-icons/material-design-icons'
import SearchBar from '../../../components/input/SearchBar'
import Animal from '../../../schema/animal/Animal'

interface Props {
  visible: boolean
  onClose: () => void
  animals: Animal[]
  selectedIds: string[]
  onToggle: (animalId: string) => void
}

const GroupMemberPicker: React.FC<Props> = ({ visible, onClose, animals, selectedIds, onToggle }) => {
  const [search, setSearch] = useState('')

  const filtered = animals.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  const renderItem = ({ item }: { item: Animal }) => {
    const isSelected = selectedIds.includes(item.id)
    return (
      <TouchableOpacity
        className={`mx-4 mb-2 rounded-xl p-3 flex-row items-center border ${isSelected ? 'bg-primary/10 border-primary' : 'bg-surface border-border-light'}`}
        onPress={() => onToggle(item.id)}
        activeOpacity={0.7}
      >
        <View className="w-10 h-10 rounded-full bg-backgroundDark items-center justify-center mr-3 overflow-hidden">
          {item.photoUrl ? (
            <TurboImage
              source={{ uri: item.photoUrl }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              cachePolicy="dataCache"
            />
          ) : (
            <Text className="text-base font-semibold text-text-secondary">{item.name.charAt(0)}</Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-text-primary">{item.name}</Text>
          <Text className="text-sm text-text-secondary">{item.breed || item.animalType}</Text>
        </View>
        <Icon
          name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={24}
          color={isSelected ? '#4A6741' : '#BDBDBD'}
        />
      </TouchableOpacity>
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      onShow={() => setSearch('')}
    >
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-border-light">
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="p-1">
            <Icon name="close" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text-primary">Select Members</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="p-1">
            <Text className="text-base font-medium text-primary">Done</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-3 mb-2">
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name..." />
        </View>

        <Text className="px-4 pb-2 text-sm text-text-secondary">
          {selectedIds.length} selected
        </Text>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
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

export default GroupMemberPicker
