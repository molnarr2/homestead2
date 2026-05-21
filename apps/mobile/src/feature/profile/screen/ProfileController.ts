import { useState } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { bsAuthService } from '../../../Bootstrap'
import { resetAllStores } from '../../../store/resetAllStores'
import { useUserStore } from '../../../store/userStore'
import { useAnimalStore } from '../../../store/animalStore'
import { usePaywallStore } from '../../../store/paywallStore'
import { useFeedbackStore } from '../../../store/feedbackStore'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Profile'>

export function useProfileController(navigation: Navigation) {
  const user = useUserStore(s => s.user)
  const animals = useAnimalStore(s => s.animals)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const animalCount = animals.filter(a => a.state === 'own').length
  const animalTypeCount = [...new Set(animals.map(a => a.animalType))].length

  const onEditProfile = () => navigation.navigate('EditProfile')
  const onSettings = () => navigation.navigate('Settings')
  const onSubscription = () => usePaywallStore.getState().show()
  const onSendFeedback = () => useFeedbackStore.getState().show('menu')

  const onLogoutPress = () => setShowLogoutDialog(true)
  const onLogoutCancel = () => setShowLogoutDialog(false)
  const onLogoutConfirm = () => {
    setShowLogoutDialog(false)
    bsAuthService.signout()
    resetAllStores()
  }

  return {
    user, animalCount, animalTypeCount,
    onEditProfile, onSettings, onSubscription, onSendFeedback,
    showLogoutDialog, onLogoutPress, onLogoutCancel, onLogoutConfirm,
  }
}
