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
  onSelect: (animalId: string) => void
}

const AnimalPickerModal: React.FC<Props> = ({ visible, onClose, animals, onSelect }) => {
  const [search, setSearch] = useState('')

  const handleOpen = () => {
    setSearch('')
  }

  const filtered = animals.filter(a =>
    a.state === 'own' && a.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (animalId: string) => {
    onSelect(animalId)
    onClose()
  }

  const renderItem = ({ item }: { item: Animal }) => (
    <TouchableOpacity
      className="mx-4 mb-2 bg-surface rounded-xl p-3 flex-row items-center border border-border-light"
      onPress={() => handleSelect(item.id)}
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 rounded-full bg-backgroundDark items-center justify-center mr-3 overflow-hidden">
        {item.photoUrl ? (
          <TurboImage
            source={{ uri: item.photoUrl }}
            style={{ width: 48, height: 48, borderRadius: 24 }}
            cachePolicy="dataCache"
          />
        ) : (
          <Text className="text-lg font-semibold text-text-secondary">{item.name.charAt(0)}</Text>
        )}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-text-primary">{item.name}</Text>
        <Text className="text-sm text-text-secondary capitalize">
          {item.gender !== 'unknown' ? item.gender : ''}{item.gender !== 'unknown' && item.register ? ' · ' : ''}{item.register ? `#${item.register}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  )

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

export default AnimalPickerModal
