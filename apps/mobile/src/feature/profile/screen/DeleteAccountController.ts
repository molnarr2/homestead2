import { useState } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { bsAuthService } from '../../../Bootstrap'
import { teardownApp } from '../../../store/appInitializer'
import { useUserStore } from '../../../store/userStore'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'DeleteAccount'>

export function useDeleteAccountController(navigation: Navigation) {
  const user = useUserStore(s => s.user)
  const isAnonymous = bsAuthService.isAnonymous

  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')

    if (isAnonymous) {
      if (confirmText.trim() !== 'DELETE') {
        setError('Type DELETE to confirm.')
        return
      }
    } else if (password.length === 0) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)

    if (!isAnonymous) {
      const reauth = await bsAuthService.reauthenticate(user?.email ?? '', password)
      if (!reauth.success) {
        setError(reauth.error)
        setLoading(false)
        return
      }
    }

    const result = await bsAuthService.deleteAccount()
    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    bsAuthService.signout()
    teardownApp()
  }

  return {
    isAnonymous,
    password, setPassword,
    confirmText, setConfirmText,
    loading, error, submit,
  }
}
