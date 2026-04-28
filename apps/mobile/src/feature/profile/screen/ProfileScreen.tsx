import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import ConfirmDialog from '../../../components/dialog/ConfirmDialog'
import Icon from '@react-native-vector-icons/material-design-icons'
import { useProfileController } from './ProfileController'
import { useHomesteadStore } from '../../../store/homesteadStore'
import { effectiveSubscription } from '../../subscription/service/ISubscriptionService'

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>

interface MenuItemRowProps {
  label: string
  onPress: () => void
}

const MenuItemRow: React.FC<MenuItemRowProps> = ({ label, onPress }) => (
  <TouchableOpacity
    className="flex-row items-center justify-between px-4 py-4 bg-surface"
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text className="text-base text-text-primary">{label}</Text>
    <Icon name="chevron-right" size={24} color="#9E9E9E" />
  </TouchableOpacity>
)

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const c = useProfileController(navigation)
  const homestead = useHomesteadStore(s => s.homestead)
  const tier = effectiveSubscription(homestead)
  const fullName = `${c.user?.firstName ?? ''} ${c.user?.lastName ?? ''}`.trim()
  const subscriptionLabel = tier.charAt(0).toUpperCase() + tier.slice(1)

  return (
    <ScreenContainer>
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-left" size={24} color="#333333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text-primary ml-3">Profile</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="items-center py-6">
          <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-3">
            <Text className="text-3xl font-bold text-text-inverse">
              {c.user?.firstName?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text className="text-xl font-bold text-text-primary">{fullName || 'User'}</Text>
          <Text className="text-sm text-text-secondary mt-1">{c.user?.email ?? ''}</Text>
          <View className="mt-2 rounded-full bg-accent px-3 py-1">
            <Text className="text-xs font-semibold text-primary-dark">{subscriptionLabel}</Text>
          </View>
        </View>

        <View className="flex-row px-4 mb-6">
          <View className="flex-1 bg-surface rounded-xl py-4 items-center mr-2 border border-border-light">
            <Text className="text-2xl font-bold text-primary">{c.animalCount}</Text>
            <Text className="text-xs text-text-secondary mt-1">Animals</Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl py-4 items-center ml-2 border border-border-light">
            <Text className="text-2xl font-bold text-primary">{c.animalTypeCount}</Text>
            <Text className="text-xs text-text-secondary mt-1">Species</Text>
          </View>
        </View>

        <View className="border-t border-border-light">
          <MenuItemRow label="Edit Profile" onPress={c.onEditProfile} />
          <View className="h-px bg-border-light ml-4" />
          <MenuItemRow label="Subscription" onPress={c.onSubscription} />
          <View className="h-px bg-border-light ml-4" />
          <MenuItemRow label="Settings" onPress={c.onSettings} />
          <View className="h-px bg-border-light ml-4" />
          <MenuItemRow label="Send Feedback" onPress={c.onSendFeedback} />
        </View>

        <View className="px-4 mt-8 mb-6">
          <TouchableOpacity
            className="py-3 items-center"
            onPress={c.onLogoutPress}
            activeOpacity={0.7}
          >
            <Text className="text-base font-semibold text-status-error">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={c.showLogoutDialog}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        destructive
        onConfirm={c.onLogoutConfirm}
        onCancel={c.onLogoutCancel}
      />
    </ScreenContainer>
  )
}

export default ProfileScreen
