import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import TurboImage from 'react-native-turbo-image'
import Icon from '@react-native-vector-icons/material-design-icons'
import type Animal from '../../schema/animal/Animal'
import type AnimalGroup from '../../schema/animalGroup/AnimalGroup'

interface Props {
  selectedAnimal: Animal | null
  selectedGroup: AnimalGroup | null
  onPress: () => void
  readOnly: boolean
  label: string
  showGroups: boolean
}

const AnimalOrGroupField: React.FC<Props> = ({ selectedAnimal, selectedGroup, onPress, readOnly, label, showGroups }) => {
  const Wrapper = readOnly ? View : TouchableOpacity
  const wrapperProps = readOnly ? {} : { onPress, activeOpacity: 0.7 }

  return (
    <>
      {!readOnly && <Text className="text-sm font-medium text-text-primary mb-1 mt-4">{label}</Text>}
      <Wrapper
        className={`flex-row items-center border border-border-light rounded-lg px-3 py-3 mb-4 ${readOnly ? 'bg-backgroundDark mt-4' : 'bg-surface'}`}
        {...wrapperProps}
      >
        {selectedAnimal ? (
          <>
            <View className="w-10 h-10 rounded-full bg-backgroundDark items-center justify-center mr-3 overflow-hidden">
              {selectedAnimal.photoUrl ? (
                <TurboImage
                  source={{ uri: selectedAnimal.photoUrl }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                  cachePolicy="dataCache"
                />
              ) : (
                <Text className="text-base font-semibold text-text-secondary">
                  {selectedAnimal.name.charAt(0)}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-text-primary">{selectedAnimal.name}</Text>
              <Text className="text-sm text-text-secondary capitalize">
                {selectedAnimal.gender !== 'unknown' ? selectedAnimal.gender : ''}{selectedAnimal.gender !== 'unknown' && selectedAnimal.register ? ' · ' : ''}{selectedAnimal.register ? `#${selectedAnimal.register}` : ''}
              </Text>
            </View>
          </>
        ) : selectedGroup ? (
          <>
            <View className="w-10 h-10 rounded-full bg-backgroundDark items-center justify-center mr-3 overflow-hidden">
              {selectedGroup.photoUrl ? (
                <TurboImage
                  source={{ uri: selectedGroup.photoUrl }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                  cachePolicy="dataCache"
                />
              ) : (
                <Icon name="account-group" size={20} color="#4A6741" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-text-primary">{selectedGroup.name}</Text>
              <Text className="text-sm text-text-secondary">
                {selectedGroup.animalIds.length} member{selectedGroup.animalIds.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </>
        ) : (
          <>
            <View className="w-10 h-10 rounded-full bg-backgroundDark items-center justify-center mr-3">
              <Icon name="cow" size={20} color="#BDBDBD" />
            </View>
            <Text className="flex-1 text-base text-text-secondary">
              {showGroups ? 'Select Animal or Group' : 'Select Animal'}
            </Text>
          </>
        )}
        {!readOnly && <Icon name="chevron-right" size={20} color="#BDBDBD" />}
      </Wrapper>
    </>
  )
}

export default AnimalOrGroupField
