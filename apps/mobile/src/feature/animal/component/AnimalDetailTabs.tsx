import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'

export type AnimalTab = 'timeline' | 'health' | 'breeding' | 'care' | 'notes' | 'weight'

interface Props {
  activeTab: AnimalTab
  onTabChange: (tab: AnimalTab) => void
}

const TABS: { key: AnimalTab; label: string }[] = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'health', label: 'Health' },
  { key: 'breeding', label: 'Breeding' },
  { key: 'care', label: 'Care' },
  { key: 'notes', label: 'Notes' },
  { key: 'weight', label: 'Weight' },
]

const AnimalDetailTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <View className="bg-surface border-b border-border-light">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key
          return (
            <TouchableOpacity
              key={tab.key}
              className={`px-4 py-3 mr-1 ${isActive ? 'border-b-2 border-b-primary' : ''}`}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

export default AnimalDetailTabs
