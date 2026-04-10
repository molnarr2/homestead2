import React from 'react'
import { View, Text } from 'react-native'

interface Props {
  title: string
  count: number
}

const AnimalListByType: React.FC<Props> = ({ title, count }) => {
  return (
    <View className="flex-row items-center px-4 pt-4 pb-2">
      <Text className="text-lg font-semibold text-text-primary">{title}</Text>
      <View className="ml-2 px-2 py-0.5 rounded-full bg-primary">
        <Text className="text-xs font-bold text-text-inverse">{count}</Text>
      </View>
    </View>
  )
}

export default AnimalListByType
