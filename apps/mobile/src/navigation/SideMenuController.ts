import { useState } from 'react'
import { useUserStore } from '../store/userStore'
import { bsAuthService } from '../Bootstrap'
import { teardownApp } from '../store/appInitializer'

export function useSideMenuController() {
  const user = useUserStore(s => s.user)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const isAnonymous = user?.anonymous ?? false

  const logout = () => {
    if (isAnonymous) {
      setShowLogoutDialog(true)
      return
    }
    bsAuthService.signout()
    teardownApp()
  }

  const onLogoutConfirm = () => {
    setShowLogoutDialog(false)
    bsAuthService.signout()
    teardownApp()
  }

  const onLogoutCancel = () => setShowLogoutDialog(false)

  return { user, isAnonymous, logout, showLogoutDialog, onLogoutConfirm, onLogoutCancel }
}
