import React from 'react'
import { View } from 'react-native'

interface Props {
  children: React.ReactNode
}

const ScreenContainer: React.FC<Props> = ({ children }) => {
  return (
    <View className="flex-1 bg-background">
      {children}
    </View>
  )
}

export default ScreenContainer
