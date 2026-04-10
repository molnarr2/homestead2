import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from '@react-native-vector-icons/material-design-icons'
import HomeScreen from '../home/HomeScreen'
import AnimalListScreen from '../animal/screen/AnimalListScreen'
import ProductionScreen from '../production/ProductionScreen'
import CareListScreen from '../care/screen/CareListScreen'

export type MainTabParamList = {
  Home: undefined
  Animals: undefined
  Production: undefined
  Care: undefined
}

const Tab = createBottomTabNavigator<MainTabParamList>()

export function MainScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            Home: ['home', 'home-outline'],
            Animals: ['paw', 'paw-outline'],
            Production: ['egg', 'egg-outline'],
            Care: ['medical-bag', 'medical-bag'],
          }
          const [active, inactive] = icons[route.name] ?? ['circle', 'circle-outline']
          const iconName = (focused ? active : inactive) as React.ComponentProps<typeof Icon>['name']
          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#4A6741',
        tabBarInactiveTintColor: '#6B6B6B',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Animals" component={AnimalListScreen} />
      <Tab.Screen name="Production" component={ProductionScreen} />
      <Tab.Screen name="Care" component={CareListScreen} />
    </Tab.Navigator>
  )
}
