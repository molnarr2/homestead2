import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { MainScreen } from '../feature/main/MainScreen'
import { SideMenu } from './SideMenu'

const Drawer = createDrawerNavigator()

export function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SideMenu {...props} />}
      screenOptions={{ headerShown: false, drawerType: 'slide' }}
    >
      <Drawer.Screen name="MainTabs" component={MainScreen} />
    </Drawer.Navigator>
  )
}
