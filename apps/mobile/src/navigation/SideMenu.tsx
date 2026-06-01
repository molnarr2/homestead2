import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { DrawerContentScrollView, type DrawerContentComponentProps } from '@react-navigation/drawer'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from './RootNavigation'
import { useSideMenuController } from './SideMenuController'
import { useHomesteadStore } from '../store/homesteadStore'
import { effectiveSubscription } from '../feature/subscription/service/ISubscriptionService'
import { usePaywallStore } from '../store/paywallStore'
import { useFeedbackStore } from '../store/feedbackStore'
import PrimaryButton from '../components/button/PrimaryButton'
import AppDialog from '../components/dialog/AppDialog'

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
  const { user, isAnonymous, logout, showLogoutDialog, onLogoutConfirm, onLogoutCancel } = useSideMenuController()
  const homestead = useHomesteadStore(s => s.homestead)
  const tier = effectiveSubscription(homestead)
  const rootNavigation = useNavigation<RootNavigation>()

  const displayName = isAnonymous ? 'Guest User' : `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
  const displayEmail = isAnonymous ? 'No email' : (user?.email ?? '')

  const navigateTo = (screen: keyof RootStackParamList) => {
    props.navigation.closeDrawer()
    rootNavigation.navigate(screen as never)
  }

  const onLogoutCreateAccount = () => {
    onLogoutCancel()
    navigateTo('LinkAccount')
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
                {isAnonymous ? 'G' : (user?.firstName?.charAt(0)?.toUpperCase() ?? '?')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text-primary">
          {displayName}
        </Text>
        <Text className="text-sm text-text-secondary">{displayEmail}</Text>
        <View className="mt-2 self-start rounded-full bg-accent px-3 py-1">
          <Text className="text-xs font-semibold text-primary-dark">
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </Text>
        </View>
      </View>

      <Divider />

      {isAnonymous && (
        <MenuItem label="Create Account" onPress={() => navigateTo('LinkAccount')} />
      )}
      <MenuItem label="Profile" onPress={() => navigateTo('Profile')} />
      <MenuItem label="Subscription" onPress={() => { props.navigation.closeDrawer(); usePaywallStore.getState().show() }} />
      <MenuItem label="Customization" onPress={() => navigateTo('Customization')} />

      <Divider />

      <MenuItem label="Settings" onPress={() => navigateTo('Settings')} />
      <MenuItem label="Send Feedback" onPress={() => { props.navigation.closeDrawer(); useFeedbackStore.getState().show('menu') }} />

      <Divider />

      <MenuItem label="Debug Theme" onPress={() => navigateTo('Debug')} />

      <Divider />

      <View className="px-4 py-4">
        <PrimaryButton title="Logout" onPress={logout} />
      </View>

      {isAnonymous && (
        <AppDialog
          visible={showLogoutDialog}
          onDismiss={onLogoutCancel}
          title="Log Out"
        >
          <Text className="text-sm text-text-secondary mb-4">
            You're using a guest account. Logging out will permanently lose access to all your data. Create an account first to keep your data.
          </Text>
          <TouchableOpacity className="bg-primary rounded-xl py-3 items-center mb-2" onPress={onLogoutCreateAccount} activeOpacity={0.7}>
            <Text className="text-base font-semibold text-text-inverse">Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-status-error rounded-xl py-3 items-center mb-2" onPress={onLogoutConfirm} activeOpacity={0.7}>
            <Text className="text-base font-semibold text-text-inverse">Log Out</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-3 items-center" onPress={onLogoutCancel} activeOpacity={0.7}>
            <Text className="text-base font-semibold text-text-secondary">Cancel</Text>
          </TouchableOpacity>
        </AppDialog>
      )}
    </DrawerContentScrollView>
  )
}
