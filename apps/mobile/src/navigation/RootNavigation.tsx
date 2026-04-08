import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeScreen from '../feature/home/HomeScreen'
import DebugScreen from '../feature/debug/DebugScreen'

export type RootStackParamList = {
  Home: undefined
  Debug: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const RootNavigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Debug"
          component={DebugScreen}
          options={{ headerShown: true, title: 'Debug Theme' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default RootNavigation
