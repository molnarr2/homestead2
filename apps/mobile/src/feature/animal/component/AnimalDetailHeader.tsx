import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import TurboImage from 'react-native-turbo-image'
import Icon from '@react-native-vector-icons/material-design-icons'
import Animal from '../../../schema/animal/Animal'
import { AnimalAge } from '../../../util/AnimalUtility'

interface Props {
  animal: Animal
  age: AnimalAge
  onEdit: () => void
  onBack: () => void
}

const STATE_BADGE_COLORS: Record<string, string> = {
  own: 'bg-status-success',
  sold: 'bg-status-info',
  deceased: 'bg-status-error',
  processed: 'bg-status-warning',
}

const AnimalDetailHeader: React.FC<Props> = ({ animal, age, onEdit, onBack }) => {
  const hasPhoto = !!animal.photoUrl

  return (
    <View className="bg-surface border-b border-border-light">
      {hasPhoto ? (
        <View className="relative">
          <TurboImage
            source={{ uri: animal.photoUrl }}
            style={{ width: '100%', height: 256 }}
            cachePolicy="dataCache"
          />
          <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-4 pt-4 z-10">
            <TouchableOpacity onPress={onBack} activeOpacity={0.7} className="p-1" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.9, shadowRadius: 3, elevation: 5 }}>
              <Icon name="arrow-left" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onEdit} activeOpacity={0.7} className="p-1" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.9, shadowRadius: 3, elevation: 5 }}>
              <Icon name="pencil" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-10" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-white">{animal.name}</Text>
                <View className="flex-row items-center mt-0.5">
                  {animal.register ? (
                    <Text className="text-sm text-gray-200">#{animal.register}</Text>
                  ) : null}
                  {animal.register && age.display ? (
                    <Text className="text-sm text-gray-200"> · </Text>
                  ) : null}
                  {age.display ? (
                    <Text className="text-sm text-gray-200">{age.display}</Text>
                  ) : null}
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <View className={`px-3 py-1 rounded-full ${STATE_BADGE_COLORS[animal.state] || 'bg-primary'}`}>
                  <Text className="text-xs font-bold text-white capitalize">{animal.state}</Text>
                </View>
                {animal.gender !== 'unknown' ? (
                  <View className="px-3 py-1 rounded-full bg-white/30">
                    <Text className="text-xs font-bold text-white capitalize">{animal.gender}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      ) : (
        <>
          <View className="flex-row items-center justify-between px-4 pt-4 mb-3">
            <TouchableOpacity onPress={onBack} activeOpacity={0.7} className="p-1">
              <Icon name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onEdit} activeOpacity={0.7} className="p-1">
              <Icon name="pencil" size={24} color="#4A6741" />
            </TouchableOpacity>
          </View>
          <View className="self-center w-24 h-24 rounded-full bg-backgroundDark items-center justify-center mb-3">
            <Text className="text-3xl font-bold text-text-secondary">{animal.name.charAt(0)}</Text>
          </View>
          <View className="px-4 py-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-text-primary">{animal.name}</Text>
                <View className="flex-row items-center mt-0.5">
                  {animal.register ? (
                    <Text className="text-sm text-text-secondary">#{animal.register}</Text>
                  ) : null}
                  {animal.register && age.display ? (
                    <Text className="text-sm text-text-secondary"> · </Text>
                  ) : null}
                  {age.display ? (
                    <Text className="text-sm text-text-secondary">{age.display}</Text>
                  ) : null}
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <View className={`px-3 py-1 rounded-full ${STATE_BADGE_COLORS[animal.state] || 'bg-primary'}`}>
                  <Text className="text-xs font-bold text-text-inverse capitalize">{animal.state}</Text>
                </View>
                {animal.gender !== 'unknown' ? (
                  <View className="px-3 py-1 rounded-full bg-backgroundDark">
                    <Text className="text-xs font-bold text-text-primary capitalize">{animal.gender}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  )
}

export default AnimalDetailHeader
