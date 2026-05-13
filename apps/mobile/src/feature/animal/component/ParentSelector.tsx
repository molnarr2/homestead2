import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native'
import TurboImage from 'react-native-turbo-image'
import Icon from '@react-native-vector-icons/material-design-icons'
import { useAnimalStore } from '../../../store/animalStore'
import Animal, { AnimalGender } from '../../../schema/animal/Animal'
import SearchBar from '../../../components/input/SearchBar'

interface Props {
  label: string
  animalTypeId: string
  gender: AnimalGender
  selectedId: string
  onSelect: (animalId: string) => void
  excludeId?: string
  onNavigateToAnimal?: (animalId: string) => void
}

const ParentSelector: React.FC<Props> = ({ label, animalTypeId, gender, selectedId, onSelect, excludeId, onNavigateToAnimal }) => {
  const { animals } = useAnimalStore()
  const [visible, setVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAnimals = animals.filter(a => {
    if (a.id === excludeId) return false
    if (a.state !== 'own') return false
    if (animalTypeId && a.animalTypeId !== animalTypeId) return false
    if (gender !== 'unknown' && a.gender !== gender) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return a.name.toLowerCase().includes(query) || a.breed.toLowerCase().includes(query)
    }
    return true
  })

  const selectedAnimal = animals.find(a => a.id === selectedId)

  const handleSelect = (animalId: string) => {
    onSelect(animalId)
    setVisible(false)
    setSearchQuery('')
  }

  const handleClear = () => {
    onSelect('')
    setVisible(false)
    setSearchQuery('')
  }

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-text-primary mb-1">{label}</Text>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          className="flex-1 border border-border-light rounded-lg px-4 py-3 bg-surface flex-row items-center justify-between"
          onPress={() => setVisible(true)}
          activeOpacity={0.7}
        >
          <Text className={selectedAnimal ? 'text-base text-text-primary' : 'text-base text-text-disabled'}>
            {selectedAnimal ? selectedAnimal.name : `Select ${label.toLowerCase()}...`}
          </Text>
          <Icon name="chevron-down" size={20} color="#6B6B6B" />
        </TouchableOpacity>
        {selectedAnimal ? (
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-backgroundDark items-center justify-center overflow-hidden border border-border-light"
            onPress={() => onNavigateToAnimal?.(selectedAnimal.id)}
            activeOpacity={0.7}
          >
            {selectedAnimal.photoUrl ? (
              <TurboImage
                source={{ uri: selectedAnimal.photoUrl }}
                style={{ width: 44, height: 44, borderRadius: 22 }}
                cachePolicy="dataCache"
              />
            ) : (
              <Text className="text-base font-semibold text-text-secondary">{selectedAnimal.name.charAt(0)}</Text>
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background">
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
            <Text className="text-xl font-bold text-text-primary">Select {label}</Text>
            <TouchableOpacity onPress={() => { setVisible(false); setSearchQuery('') }} activeOpacity={0.7}>
              <Icon name="close" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <View className="py-2">
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search animals..." />
          </View>

          {selectedId ? (
            <TouchableOpacity
              className="mx-4 mb-2 py-2 items-center"
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text className="text-sm text-status-error">Clear Selection</Text>
            </TouchableOpacity>
          ) : null}

          <FlatList
            data={filteredAnimals}
            keyExtractor={(item: Animal) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`mx-4 mb-2 p-3 rounded-lg border ${item.id === selectedId ? 'border-primary bg-primary/5' : 'border-border-light bg-surface'}`}
                onPress={() => handleSelect(item.id)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-backgroundDark items-center justify-center mr-3">
                    <Text className="text-base font-semibold text-text-secondary">{item.name.charAt(0)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-text-primary">{item.name}</Text>
                    <Text className="text-xs text-text-secondary">{item.breed || item.animalType}</Text>
                  </View>
                  {item.id === selectedId ? (
                    <Icon name="check-circle" size={20} color="#4A6741" />
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="items-center py-8">
                <Text className="text-sm text-text-secondary">No matching animals found</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  )
}

export default ParentSelector
