import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useNoteDetailController } from './NoteDetailController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import ConfirmDialog from '../../../components/dialog/ConfirmDialog'
import Icon from '@react-native-vector-icons/material-design-icons'
import { tstampToDateOrNow } from '../../../schema/type/Tstamp'
import { formatDate, formatRelativeTime } from '../../../util/DateUtility'
import type { NoteTag } from '../../../schema/notes/Note'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'NoteDetail'>
type Route = RouteProp<RootStackParamList, 'NoteDetail'>

const TAG_COLORS: Record<NoteTag, string> = {
  Health: 'bg-[#E53935]',
  Behavior: 'bg-[#2196F3]',
  Breeding: 'bg-[#9C27B0]',
  Feed: 'bg-[#FF9800]',
  Production: 'bg-[#4CAF50]',
  General: 'bg-[#9E9E9E]',
}

const NoteDetailScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const controller = useNoteDetailController(navigation, route)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (!controller.note) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-text-secondary">Note not found</Text>
        </View>
      </ScreenContainer>
    )
  }

  const { note } = controller
  const createdDate = tstampToDateOrNow(note.admin.created_at)
  const dateStr = formatDate(createdDate.toISOString())
  const relativeStr = formatRelativeTime(createdDate.toISOString())

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={controller.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Note</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="mt-4 bg-surface rounded-xl p-4 border border-border-light">
          <Text className="text-base text-text-primary leading-6">{note.text}</Text>
        </View>

        {note.tags.length > 0 ? (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {note.tags.map(tag => (
              <View key={tag} className={`px-3 py-1 rounded-full ${TAG_COLORS[tag]}`}>
                <Text className="text-xs font-medium text-white">{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {note.photoUrl ? (
          <View className="mt-4">
            <Image source={{ uri: note.photoUrl }} className="w-full h-64 rounded-xl" resizeMode="cover" />
          </View>
        ) : null}

        <View className="flex-row items-center mt-4">
          <Icon name="clock-outline" size={16} color="#9E9E9E" />
          <Text className="text-sm text-text-secondary ml-1">{dateStr}</Text>
          <Text className="text-sm text-text-disabled ml-2">({relativeStr})</Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center bg-status-error/10 border border-status-error rounded-lg py-3 mt-6 mb-8"
          onPress={() => setShowDeleteDialog(true)}
          activeOpacity={0.7}
        >
          <Icon name="delete-outline" size={20} color="#E53935" />
          <Text className="text-sm font-medium text-status-error ml-2">Delete Note</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          setShowDeleteDialog(false)
          controller.onDelete()
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </ScreenContainer>
  )
}

export default NoteDetailScreen
