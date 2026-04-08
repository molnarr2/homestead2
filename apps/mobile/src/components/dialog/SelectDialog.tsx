import React from 'react'
import { Text, TouchableOpacity, FlatList, View } from 'react-native'
import AppDialog from './AppDialog'

interface SelectItem {
  label: string
  value: string
}

interface SelectDialogProps {
  visible: boolean
  onDismiss: () => void
  title: string
  items: SelectItem[]
  onSelect: (value: string) => void
  selectedValue?: string
}

const SelectDialog: React.FC<SelectDialogProps> = ({
  visible,
  onDismiss,
  title,
  items,
  onSelect,
  selectedValue,
}) => {
  return (
    <AppDialog visible={visible} onDismiss={onDismiss} title={title}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => {
          const isSelected = item.value === selectedValue
          return (
            <TouchableOpacity
              className={`flex-row items-center justify-between py-3 px-2 ${isSelected ? 'bg-primary/10' : ''} rounded-lg`}
              onPress={() => onSelect(item.value)}
              activeOpacity={0.7}
            >
              <Text className={`text-base ${isSelected ? 'text-primary font-semibold' : 'text-text-primary'}`}>
                {item.label}
              </Text>
              {isSelected ? (
                <Text className="text-primary text-base">✓</Text>
              ) : null}
            </TouchableOpacity>
          )
        }}
        ItemSeparatorComponent={() => <View className="h-px bg-border-light" />}
      />
    </AppDialog>
  )
}

export default SelectDialog
