import React, { useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, Modal } from 'react-native'
import type Animal from '../../../schema/animal/Animal'
import TextInput from '../../../components/input/TextInput'
import SearchBar from '../../../components/input/SearchBar'
import Icon from '@react-native-vector-icons/material-design-icons'

interface Props {
  animalTypeId: string
  animals: Animal[]
  selectedId: string
  manualName: string
  onSelect: (animalId: string) => void
  onManualNameChange: (name: string) => void
}

const SireSelector: React.FC<Props> = ({
  animalTypeId, animals, selectedId, manualName, onSelect, onManualNameChange,
}) => {
  const [mode, setMode] = useState<'herd' | 'manual'>('herd')
  const [visible, setVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const eligibleSires = animals.filter(a => {
    if (a.state !== 'own') return false
    if (animalTypeId && a.animalTypeId !== animalTypeId) return false
    if (a.gender !== 'male') return false
    if (searchQuery) {
      return a.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  const selectedSire = animals.find(a => a.id === selectedId)

  const handleSelect = (id: string) => {
    onSelect(id)
    setVisible(false)
    setSearchQuery('')
  }

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-text-primary mb-2">Sire</Text>

      <View className="flex-row gap-2 mb-2">
        <TouchableOpacity
          className={`flex-1 py-2 rounded-lg border items-center ${
            mode === 'herd' ? 'bg-primary border-primary' : 'bg-surface border-border-light'
          }`}
          onPress={() => setMode('herd')}
          activeOpacity={0.7}
        >
          <Text className={`text-sm font-medium ${
            mode === 'herd' ? 'text-text-inverse' : 'text-text-primary'
          }`}>
            Select from herd
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2 rounded-lg border items-center ${
            mode === 'manual' ? 'bg-primary border-primary' : 'bg-surface border-border-light'
          }`}
          onPress={() => setMode('manual')}
          activeOpacity={0.7}
        >
          <Text className={`text-sm font-medium ${
            mode === 'manual' ? 'text-text-inverse' : 'text-text-primary'
          }`}>
            Enter name manually
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'herd' ? (
        <>
          <TouchableOpacity
            className="border border-border-light rounded-lg px-4 py-3 bg-surface flex-row items-center justify-between"
            onPress={() => setVisible(true)}
            activeOpacity={0.7}
          >
            <Text className={selectedSire ? 'text-base text-text-primary' : 'text-base text-text-secondary'}>
              {selectedSire ? selectedSire.name : 'Select sire...'}
            </Text>
            <Icon name="chevron-down" size={20} color="#9E9E9E" />
          </TouchableOpacity>

          <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-background">
              <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                <TouchableOpacity onPress={() => { setVisible(false); setSearchQuery('') }} activeOpacity={0.7} className="p-1">
                  <Icon name="close" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-text-primary">Select Sire</Text>
                <View className="w-8" />
              </View>
              <View className="mb-2">
                <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
              </View>
              <FlatList
                data={eligibleSires}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`px-4 py-3 border-b border-border-light flex-row items-center ${
                      item.id === selectedId ? 'bg-primary/10' : ''
                    }`}
                    onPress={() => handleSelect(item.id)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-1">
                      <Text className="text-base font-medium text-text-primary">{item.name}</Text>
                      <Text className="text-sm text-text-secondary">{item.breed || item.animalType}</Text>
                    </View>
                    {item.id === selectedId && (
                      <Icon name="check" size={20} color="#4A6741" />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View className="items-center py-8">
                    <Text className="text-base text-text-secondary">No eligible sires found</Text>
                  </View>
                }
              />
            </View>
          </Modal>
        </>
      ) : (
        <TextInput
          value={manualName}
          onChangeText={onManualNameChange}
          placeholder="Enter sire name"
          autoCapitalize="words"
        />
      )}
    </View>
  )
}

export default SireSelector
