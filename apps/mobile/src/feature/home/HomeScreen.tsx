import React from 'react'
import { View, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import PrimaryButton from '../../components/button/PrimaryButton'
import type { RootStackParamList } from '../../navigation/RootNavigation'

type HomeNavigation = NativeStackNavigationProp<RootStackParamList>

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavigation>()

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Text className="text-2xl font-bold text-text-primary mb-2">Homestead</Text>
      <Text className="text-base text-text-secondary mb-8">Today Dashboard</Text>
      <View className="w-full max-w-xs">
        <PrimaryButton title="Open Debug Screen" onPress={() => navigation.navigate('Debug')} />
      </View>
    </View>
  )
}

export default HomeScreen
