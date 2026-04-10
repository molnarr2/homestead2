import React from 'react'
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import Icon from '@react-native-vector-icons/material-design-icons'
import Note from '../../../schema/notes/Note'
import { tstampToDateOrNow } from '../../../schema/type/Tstamp'
import { formatDate } from '../../../util/DateUtility'
import EmptyState from '../../../components/layout/EmptyState'

type Navigation = NativeStackNavigationProp<RootStackParamList>

interface Props {
  notes: Note[]
  onAddNote: () => void
}

const TAG_COLORS: Record<string, string> = {
  Health: 'bg-status-error/20',
  Behavior: 'bg-status-info/20',
  Breeding: 'bg-status-warning/20',
  Feed: 'bg-primaryLight/20',
  Production: 'bg-accent/20',
  General: 'bg-backgroundDark',
}

const AnimalNotesTab: React.FC<Props> = ({ notes, onAddNote }) => {
  const navigation = useNavigation<Navigation>()

  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = tstampToDateOrNow(a.admin.created_at).getTime()
    const dateB = tstampToDateOrNow(b.admin.created_at).getTime()
    return dateB - dateA
  })

  return (
    <View className="flex-1">
      {sortedNotes.length === 0 ? (
        <EmptyState icon="note-text" title="No notes" subtitle="Add notes about observations, behavior, or anything else" />
      ) : (
        <FlatList
          data={sortedNotes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const createdDate = tstampToDateOrNow(item.admin.created_at)
            return (
              <TouchableOpacity
                className="mx-4 mt-2 bg-surface rounded-lg p-3 border border-border-light"
                onPress={() => navigation.navigate('NoteDetail', { noteId: item.id, animalId: item.animalId })}
                activeOpacity={0.7}
              >
                <View className="flex-row">
                  <View className="flex-1">
                    <Text className="text-sm text-text-primary" numberOfLines={3}>{item.text}</Text>
                    {item.tags.length > 0 ? (
                      <View className="flex-row flex-wrap gap-1 mt-2">
                        {item.tags.map(tag => (
                          <View key={tag} className={`px-2 py-0.5 rounded-full ${TAG_COLORS[tag] || 'bg-backgroundDark'}`}>
                            <Text className="text-xs text-text-secondary">{tag}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                    <Text className="text-xs text-text-disabled mt-2">{formatDate(createdDate.toISOString())}</Text>
                  </View>
                  {item.photoUrl ? (
                    <Image source={{ uri: item.photoUrl }} className="w-14 h-14 rounded-lg ml-3" resizeMode="cover" />
                  ) : null}
                </View>
              </TouchableOpacity>
            )
          }}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-primary items-center justify-center shadow-lg"
        onPress={onAddNote}
        activeOpacity={0.7}
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  )
}

export default AnimalNotesTab
