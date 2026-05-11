import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { DrawerContentScrollView, type DrawerContentComponentProps } from '@react-navigation/drawer'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from './RootNavigation'
import { useSideMenuController } from './SideMenuController'
import { useHomesteadStore } from '../store/homesteadStore'
import { effectiveSubscription } from '../feature/subscription/service/ISubscriptionService'
import PrimaryButton from '../components/button/PrimaryButton'

type RootNavigation = NativeStackNavigationProp<RootStackParamList>

interface MenuItemProps {
  label: string
  onPress: () => void
}

const MenuItem: React.FC<MenuItemProps> = ({ label, onPress }) => (
  <TouchableOpacity className="py-3 px-4" onPress={onPress}>
    <Text className="text-base text-text-primary">{label}</Text>
  </TouchableOpacity>
)

const Divider: React.FC = () => <View className="h-px bg-border-light my-1" />

export function SideMenu(props: DrawerContentComponentProps) {
  const { user, logout } = useSideMenuController()
  const homestead = useHomesteadStore(s => s.homestead)
  const tier = effectiveSubscription(homestead)
  const rootNavigation = useNavigation<RootNavigation>()

  const navigateTo = (screen: keyof RootStackParamList) => {
    props.navigation.closeDrawer()
    rootNavigation.navigate(screen as never)
  }

  return (
    <DrawerContentScrollView {...props} className="flex-1 bg-background">
      <View className="px-4 py-6">
        <TouchableOpacity onPress={() => navigateTo('Profile')} activeOpacity={0.7}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} className="w-16 h-16 rounded-full mb-3" />
          ) : (
            <View className="w-16 h-16 rounded-full bg-primary items-center justify-center mb-3">
              <Text className="text-2xl font-bold text-text-inverse">
                {user?.firstName?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text-primary">
          {user?.firstName ?? ''} {user?.lastName ?? ''}
        </Text>
        <Text className="text-sm text-text-secondary">{user?.email ?? ''}</Text>
        <View className="mt-2 self-start rounded-full bg-accent px-3 py-1">
          <Text className="text-xs font-semibold text-primary-dark">
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </Text>
        </View>
      </View>

      <Divider />

      <MenuItem label="Profile" onPress={() => navigateTo('Profile')} />
      <MenuItem label="Subscription" onPress={() => navigateTo('Subscription')} />
      <MenuItem label="Customization" onPress={() => navigateTo('Customization')} />

      <Divider />

      <MenuItem label="Settings" onPress={() => navigateTo('Settings')} />
      <MenuItem label="Send Feedback" onPress={() => navigateTo('SendFeedback')} />

      <Divider />

      <MenuItem label="Debug Theme" onPress={() => navigateTo('Debug')} />

      <Divider />

      <View className="px-4 py-4">
        <PrimaryButton title="Logout" onPress={logout} />
      </View>
    </DrawerContentScrollView>
  )
}
