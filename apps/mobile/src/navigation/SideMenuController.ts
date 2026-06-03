import { useState } from 'react'
import { useUserStore } from '../store/userStore'
import { bsAuthService, bsNotificationService } from '../Bootstrap'
import { teardownApp } from '../store/appInitializer'

export function useSideMenuController() {
  const user = useUserStore(s => s.user)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const isAnonymous = user?.anonymous ?? false

  const logout = async () => {
    if (isAnonymous) {
      setShowLogoutDialog(true)
      return
    }
    await bsNotificationService.unregisterDevice(bsAuthService.currentUserId)
    bsAuthService.signout()
    teardownApp()
  }

  const onLogoutConfirm = async () => {
    setShowLogoutDialog(false)
    await bsNotificationService.unregisterDevice(bsAuthService.currentUserId)
    bsAuthService.signout()
    teardownApp()
  }

  const onLogoutCancel = () => setShowLogoutDialog(false)

  return { user, isAnonymous, logout, showLogoutDialog, onLogoutConfirm, onLogoutCancel }
}
