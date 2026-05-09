import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput as RNTextInput } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useEditNoteController } from './EditNoteController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import PrimaryButton from '../../../components/button/PrimaryButton'
import AnimalOrGroupField from '../../../components/input/AnimalOrGroupField'
import Icon from '@react-native-vector-icons/material-design-icons'
import { launchImageLibrary } from 'react-native-image-picker'
import type { NoteTag } from '../../../schema/notes/Note'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditNote'>
type Route = RouteProp<RootStackParamList, 'EditNote'>

const TAG_CONFIG: { tag: NoteTag; label: string; color: string; textColor: string }[] = [
  { tag: 'Health', label: 'Health', color: 'bg-[#E53935]', textColor: 'text-white' },
  { tag: 'Behavior', label: 'Behavior', color: 'bg-[#2196F3]', textColor: 'text-white' },
  { tag: 'Breeding', label: 'Breeding', color: 'bg-[#9C27B0]', textColor: 'text-white' },
  { tag: 'Feed', label: 'Feed', color: 'bg-[#FF9800]', textColor: 'text-white' },
  { tag: 'Production', label: 'Production', color: 'bg-[#4CAF50]', textColor: 'text-white' },
  { tag: 'General', label: 'General', color: 'bg-[#9E9E9E]', textColor: 'text-white' },
]

const EditNoteScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const c = useEditNoteController(navigation, route)

  if (!c.note) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-text-secondary">Note not found</Text>
        </View>
      </ScreenContainer>
    )
  }

  const handlePhotoPick = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 })
    if (result.assets?.[0]?.uri) {
      c.setPhotoUri(result.assets[0].uri)
    }
  }

  const hasPhoto = c.photoUri || c.note.photoUrl

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={c.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Edit Note</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <AnimalOrGroupField
          selectedAnimal={c.selectedAnimal}
          selectedGroup={null}
          onPress={() => {}}
          readOnly={true}
          label="Animal"
          showGroups={false}
        />

        <RNTextInput
          className="border border-border-light rounded-lg px-4 py-3 text-base text-text-primary bg-surface mt-4"
          value={c.text}
          onChangeText={c.setText}
          placeholder="What did you observe?"
          placeholderTextColor="#BDBDBD"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          style={{ minHeight: 140 }}
        />

        <Text className="text-sm font-medium text-text-primary mb-2 mt-4">Tags</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {TAG_CONFIG.map(({ tag, label, color, textColor }) => {
            const isSelected = c.tags.includes(tag)
            return (
              <TouchableOpacity
                key={tag}
                className={`px-3 py-1.5 rounded-full border ${
                  isSelected ? `${color} border-transparent` : 'bg-surface border-border-light'
                }`}
                onPress={() => c.toggleTag(tag)}
                activeOpacity={0.7}
              >
                <Text className={`text-sm font-medium ${
                  isSelected ? textColor : 'text-text-primary'
                }`}>
                  {label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text className="text-sm font-medium text-text-primary mb-2">Photo</Text>
        <TouchableOpacity
          className="flex-row items-center bg-surface border border-border-light rounded-lg px-4 py-3 mb-4"
          onPress={handlePhotoPick}
          activeOpacity={0.7}
        >
          <Icon name={hasPhoto ? 'check-circle' : 'camera-plus'} size={24} color={hasPhoto ? '#4CAF50' : '#6B6B6B'} />
          <Text className={`text-sm ml-3 ${hasPhoto ? 'text-accent' : 'text-text-secondary'}`}>
            {hasPhoto ? 'Photo attached' : 'Add a photo'}
          </Text>
        </TouchableOpacity>

        <View className="mt-4 mb-8">
          <PrimaryButton
            title="Save Changes"
            onPress={c.submit}
            loading={c.loading}
            disabled={!c.text.trim()}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

export default EditNoteScreen
